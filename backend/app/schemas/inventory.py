from pydantic import BaseModel
from typing import List, Optional, Literal

# Original schema for backward compatibility


class InventoryItem(BaseModel):
    id: int
    name: str
    category: str
    current_quantity: float
    unit: str
    minimum_threshold: float


class InventoryResponse(BaseModel):
    items: List[InventoryItem]


class RestaurantInventoryItem(BaseModel):
    id: str
    item: str
    amount: int
    ordered_amount: int = 0  # Amount that has been ordered but not received yet
    category: Optional[str] = None
    unit: Optional[str] = "units"

    class Config:
        from_attributes = True  # Renamed from orm_mode in Pydantic v2


class RestaurantInventoryResponse(BaseModel):
    restaurant_id: str
    restaurant_name: str
    items: List[RestaurantInventoryItem]
