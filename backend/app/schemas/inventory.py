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
    status: Literal["low", "sufficient", "excess"] 

class InventoryResponse(BaseModel):
    items: List[InventoryItem]

# New schema that matches our database model
class RestaurantInventoryItem(BaseModel):
    id: str
    item: str
    amount: int
    # Calculated fields that don't exist in the database but are useful for the frontend
    status: Literal["low", "sufficient", "excess"] = "sufficient"
    category: Optional[str] = None
    unit: Optional[str] = "units"
    
    class Config:
        orm_mode = True

class RestaurantInventoryResponse(BaseModel):
    restaurant_id: str
    restaurant_name: str
    items: List[RestaurantInventoryItem]
