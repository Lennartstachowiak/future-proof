from pydantic import BaseModel
import datetime
import asyncio
import aiohttp
from fastapi import APIRouter, HTTPException, Depends, Path
from typing import List
from sqlalchemy.orm import Session
import requests
import json

from app.db.session import get_db
from app.db.models import Campaign, RestaurantCustomer, Messages, Customer, Conversation  # Import Customer model

router = APIRouter()


async def get_promo_message(customer_name: str, session: aiohttp.ClientSession):
    # Replace with your actual webhook URL
    webhook_url = 'https://noam.app.n8n.cloud/webhook/6ac2c534-dfb0-4b96-9d75-2b9ba36fdbe8'

    # Define the headers
    headers = {'Content-Type': 'application/json'}

    # Define the empty payload
    payload = {
        "Customer_name": customer_name,
        "past_conversation": """Hey Lennart,\n\nHope this email finds you well! We noticed it's been a while since your last visit to our restaurant, and we miss seeing you around.\n\nNext week, we'd love to have you back! As a small token of our appreciation, enjoy a special 20% discount on your meal. Plus, we've got a surplus of fresh ingredients that we'd hate to see go to waste – so it's a win-win!\n\nLooking forward to serving you again soon.\n\nWarm regards!"""
    }

    # Make an async POST request with the payload
    async with session.get(webhook_url, headers=headers, json=payload) as response:
        print(f"Response status for {customer_name}: {response.status}")
        return await response.text()


def get_customer_ids(db: Session, restaurant_id: str) -> List[str]:
    """
    Get all customer IDs from the database.
    """
    # Assuming you have a Customer model and a customers table
    customer_ids = db.query(RestaurantCustomer.customer_id).filter(
        RestaurantCustomer.restaurant_id == restaurant_id).all()

    return [customer_id[0] for customer_id in customer_ids]


async def send_promo_message(customer_id: str, restaurant_id: str, campaign_id: str, session: aiohttp.ClientSession, db: Session):
    """Send a promotional message to a single customer using async"""
    try:
        # Get customer info
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            print(f"Customer with id {customer_id} not found.")
            return

        # Get message from API asynchronously
        customer_name = customer.name
        print(f"Fetching promo message for {customer_name}...")
        promo_message = await get_promo_message(customer_name, session)
        promo_message_json = json.loads(promo_message)
        message = promo_message_json[0]['output']
        print(f"Retrieved promo message for {customer_name}")

        # Create conversation
        new_conversation = Conversation(
            campaign_id=campaign_id,
            customer_id=customer_id,
        )
        db.add(new_conversation)
        db.commit()
        db.refresh(new_conversation)

        # Add message
        new_message = Messages(
            conversation_id=new_conversation.id,
            role="system",
            message=message,
        )
        db.add(new_message)
        db.commit()

        print(f"✓ Message sent to {customer_name}")
        return {"customer": customer_name, "status": "success"}
    except Exception as e:
        print(f"Error sending message to customer {customer_id}: {str(e)}")
        return {"customer_id": customer_id, "status": "error", "error": str(e)}


async def send_messages_to_all_customers(customer_ids: List[str], restaurant_id: str, campaign_id: str, db: Session):
    """Send promotional messages to all customers in parallel using asyncio.gather"""
    # Create a shared aiohttp session for all requests
    async with aiohttp.ClientSession() as session:
        # Create a list of tasks, one for each customer
        tasks = []
        for customer_id in customer_ids:
            task = send_promo_message(customer_id, restaurant_id, campaign_id, session, db)
            tasks.append(task)

        # Execute all tasks concurrently and wait for all to complete
        print(f"Sending {len(tasks)} messages in parallel...")
        results = await asyncio.gather(*tasks)
        print(f"All {len(results)} messages sent for campaign {campaign_id}")

        # Return summary of results
        success_count = sum(1 for r in results if r.get('status') == 'success')
        return {
            "total": len(results),
            "success": success_count,
            "failed": len(results) - success_count
        }


class CampaignCreate(BaseModel):
    name: str = None
    campaign_started_id: str = None


@router.post("/{restaurant_id}")
async def start_campaign(
    restaurant_id: str = Path(..., description="The ID of the restaurant"),
    campaign_data: CampaignCreate = None,
    db: Session = Depends(get_db)
):
    """
    Create a new campaign and send promotional messages to all customers in parallel.
    """

    # Add new element to the campaign table of the db
    new_campaign = Campaign(
        restaurant_id=restaurant_id,
        name=campaign_data.name if campaign_data and campaign_data.name else f"Campaign {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}",
        campaign_started_id=campaign_data.campaign_started_id if campaign_data and campaign_data.campaign_started_id else None,
    )
    
    # If a campaign_started_id is provided, check if a campaign with this ID already exists
    if new_campaign.campaign_started_id:
        existing_campaign = db.query(Campaign).filter(
            Campaign.restaurant_id == restaurant_id,
            Campaign.campaign_started_id == new_campaign.campaign_started_id
        ).first()
        
        if existing_campaign and existing_campaign.id != new_campaign.id:
            return {
                "id": existing_campaign.id,
                "name": existing_campaign.name,
                "message": f"Campaign with this identifier already exists (created on {existing_campaign.created_at.strftime('%Y-%m-%d')})",
                "already_exists": True
            }

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    campaign_id = new_campaign.id
    customer_ids = get_customer_ids(db, restaurant_id)

    print(f"Starting campaign '{new_campaign.name}' for {len(customer_ids)} customers")

    if not customer_ids:
        return {
            "id": campaign_id,
            "name": new_campaign.name,
            "message": "Campaign created but no customers found to send messages to"
        }

    # Send messages in parallel and wait for completion
    results = await send_messages_to_all_customers(customer_ids, restaurant_id, campaign_id, db)

    return {
        "id": campaign_id,
        "name": new_campaign.name,
        "success_count": results['success'],
        "failed_count": results['failed'],
        "total_messages": results['total'],
        "message": f"Campaign created and {results['success']} messages sent successfully"
    }
