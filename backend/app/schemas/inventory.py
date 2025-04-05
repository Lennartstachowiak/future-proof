from pydantic import BaseModel
from typing import List, Optional, Literal

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
