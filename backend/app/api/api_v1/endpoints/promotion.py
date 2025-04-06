from fastapi import APIRouter, HTTPException, Depends, Path
from typing import List, Optional
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session

from app.schemas.promotion import (
    PromotionItem,
    PromotionResponse,
    CreatePromotionRequest,
    Campaign,
    Conversation,
    Message,
    Customer,
    RestaurantCampaignResponse
)
from app.db.session import get_db
from app.db.models import Restaurant, Campaign as CampaignModel, Conversation as ConversationModel, Customer as CustomerModel, Messages

router = APIRouter()


@router.get("/restaurant/{restaurant_id}", response_model=RestaurantCampaignResponse)
async def get_restaurant_campaigns(
    restaurant_id: str = Path(..., description="The ID of the restaurant"),
    db: Session = Depends(get_db)
):
    """
    Get restaurant data including campaigns, conversations, and customers.
    This endpoint provides all the data needed for the promotion management UI.
    """
    # Check if restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Get all campaigns for this restaurant
    campaigns_data = db.query(CampaignModel).filter(CampaignModel.restaurant_id == restaurant_id).all()

    # Initialize response object
    response = RestaurantCampaignResponse(
        restaurant_id=restaurant.id,
        restaurant_name=restaurant.name,
        campaigns=[],
        customers=[]
    )

    # Get all customers who have conversations with this restaurant's campaigns
    customer_ids = set()
    for campaign in campaigns_data:
        conversations = db.query(ConversationModel).filter(ConversationModel.campaign_id == campaign.id).all()
        for conv in conversations:
            customer_ids.add(conv.customer_id)

    # Get customer details
    customers_data = db.query(CustomerModel).filter(CustomerModel.id.in_(customer_ids)).all()
    response.customers = [Customer(id=customer.id, name=customer.name) for customer in customers_data]

    # Create a mapping of customer IDs to names for easier access
    customer_map = {customer.id: customer.name for customer in customers_data}

    # Process campaigns and their conversations
    for campaign in campaigns_data:
        campaign_obj = Campaign(
            id=campaign.id,
            name=campaign.name or f"Campaign {campaign.id[:8]}",  # Use actual name or fallback to ID prefix
            description="Promotional campaign",  # Placeholder description
            created_at=campaign.created_at,  # Add the created_at timestamp
            conversations=[]
        )

        # Get conversations for this campaign
        conversations = db.query(ConversationModel).filter(ConversationModel.campaign_id == campaign.id).all()

        for conv in conversations:
            # Get messages for this conversation
            messages_data = db.query(Messages).filter(Messages.conversation_id == conv.id).order_by(Messages.id).all()

            messages = [
                Message(
                    id=msg.id,
                    role=msg.role,
                    message=msg.message,
                    timestamp=msg.created_at
                )
                for msg in messages_data
            ]

            # Create conversation object
            last_message = messages[-1].message if messages else ""
            conversation_obj = Conversation(
                id=conv.id,
                campaign_id=campaign.id,
                customer_id=conv.customer_id,
                customer_name=customer_map.get(conv.customer_id, "Unknown"),
                messages=messages,
                last_message=last_message[:50] + "..." if len(last_message) > 50 else last_message,
                last_updated=datetime.now() - timedelta(days=len(messages) - 1) if messages else datetime.now(),
                unread=False  # Default to not unread
            )

            campaign_obj.conversations.append(conversation_obj)

        response.campaigns.append(campaign_obj)

    return response
