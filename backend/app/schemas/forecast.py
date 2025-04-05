from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class ForecastItem(BaseModel):
    date: date
    item_id: int
    item_name: str
    predicted_quantity: float
    confidence: float

class ForecastResponse(BaseModel):
    items: List[ForecastItem]
