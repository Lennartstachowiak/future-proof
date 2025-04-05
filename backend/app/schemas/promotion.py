from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import date

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
