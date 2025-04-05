import threading
import concurrent.futures
from fastapi import APIRouter, HTTPException, Depends, Path
from typing import List
from sqlalchemy.orm import Session
import requests
import json

from app.db.session import get_db
from app.db.models import Campaign, RestaurantCustomer, Messages, Customer, Conversation  # Import Customer model

router = APIRouter()

def get_promo_message(customer_name: str):
    # Replace with your actual webhook URL
    webhook_url = 'https://noam.app.n8n.cloud/webhook/6ac2c534-dfb0-4b96-9d75-2b9ba36fdbe8'

    # Define the headers
    headers = {'Content-Type': 'application/json'}

    # Define the empty payload
    payload = {
        "Customer_name": customer_name,
        "past_conversation": """Hey Lennart,\n\nHope this email finds you well! We noticed it's been a while since your last visit to our restaurant, and we miss seeing you around.\n\nNext week, we'd love to have you back! As a small token of our appreciation, enjoy a special 20% discount on your meal. Plus, we've got a surplus of fresh ingredients that we'd hate to see go to waste – so it's a win-win!\n\nLooking forward to serving you again soon.\n\nWarm regards!"""
    }

    # Make a POST request with the empty JSON payload
    response = requests.get(webhook_url, headers=headers, data=json.dumps(payload))
    return response.text

def get_customer_ids(db: Session, restaurant_id: str) -> List[str]:
    """
    Get all customer IDs from the database.
    """
    # Assuming you have a Customer model and a customers table
    customer_ids = db.query(RestaurantCustomer.customer_id).filter(RestaurantCustomer.restaurant_id == restaurant_id).all()

    return [customer_id[0] for customer_id in customer_ids]

def send_promo_message(customer_id: str, restaurant_id: str, db: Session, campaign_id: str):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    
    if not customer:
        print(f"Customer with id {customer_id} not found.")
        return

    customer_name = customer.name
    promo_message = get_promo_message(customer_name)

    new_conversation = Conversation(
        campaign_id=campaign_id,
        customer_id=customer_id,
    )

    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)

    new_message = Messages(
        conversation_id=new_conversation.id,
        role="system",
        message=promo_message,
    )
    db.add(new_message)
    db.commit()

    print(promo_message)
    return

@router.post("/{restaurant_id}")
async def start_campaign(
    restaurant_id: str = Path(..., description="The ID of the restaurant"),
    db: Session = Depends(get_db)
):
    """
    Get inventory data for a specific restaurant.
    Returns all inventory items for the specified restaurant.
    """
 
    print("checkpoint 1")
    # add new element to the campaign table of the db 
    new_campaign = Campaign(
        restaurant_id=restaurant_id,
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    campaign_id = new_campaign.id

    print("checkpoint 1.5")
    customer_ids = get_customer_ids(db, restaurant_id)
    print(customer_ids)
    print("number of customers: ", len(customer_ids))

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(send_promo_message, i, restaurant_id, db, campaign_id) for i in customer_ids]
        concurrent.futures.wait(futures)

    print("checkpoint 2")

    return {"response": "201 OK"}