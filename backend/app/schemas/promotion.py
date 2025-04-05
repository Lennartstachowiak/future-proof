from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date, datetime

class PromotionItem(BaseModel):
    id: int
    item_name: str
    discount_percentage: float
    start_date: date
    end_date: date
    description: str
    status: Literal["active", "scheduled", "expired"]

class CreatePromotionRequest(BaseModel):
    item_name: str
    discount_percentage: float
    start_date: date
    end_date: date
    description: str

class PromotionResponse(BaseModel):
    items: List[PromotionItem]

# New schema classes for restaurant campaign data
class Message(BaseModel):
    id: str
    role: str  # 'user', 'system', 'assistant'
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)

class Conversation(BaseModel):
    id: str
    campaign_id: str
    customer_id: str
    customer_name: str
    messages: List[Message]
    last_message: Optional[str] = None
    last_updated: datetime = Field(default_factory=datetime.now)
    unread: bool = False

class Campaign(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    conversations: List[Conversation] = []

class Customer(BaseModel):
    id: str
    name: str

class RestaurantCampaignResponse(BaseModel):
    restaurant_id: str
    restaurant_name: str
    campaigns: List[Campaign] = []
    customers: List[Customer] = []
