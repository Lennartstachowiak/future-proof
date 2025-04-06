from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class OrderCreate(BaseModel):
    inventory_id: str
    order_amount: int


class OrderResponse(BaseModel):
    id: str
    inventory_id: str
    order_amount: int
    created_at: datetime
    updated_at: datetime
    item_name: str
    unit: str


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
