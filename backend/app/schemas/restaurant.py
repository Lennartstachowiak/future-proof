from pydantic import BaseModel
from typing import List, Optional

class Restaurant(BaseModel):
    """Schema for restaurant data"""
    id: str
    name: str
    
    class Config:
        orm_mode = True

class RestaurantListResponse(BaseModel):
    """Response schema for a list of restaurants"""
    restaurants: List[Restaurant]
