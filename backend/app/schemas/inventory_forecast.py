from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date

class InventoryForecastItem(BaseModel):
    item: str
    current_amount: int
    required_amount: int
    difference: int  # negative means shortage, positive means excess
    unit: str = "units"
    menu_items: List[str] = []  # List of menu items that require this ingredient

class PromotionRecommendation(BaseModel):
    menu_item: str
    reason: str  # Why this item is recommended for promotion
    potential_quantity: int  # How many of this item could be produced with excess ingredients
    ingredient_excesses: List[Dict[str, str]]  # Details about excess ingredients

class InventoryForecastSummary(BaseModel):
    shortages: List[InventoryForecastItem]  # Ingredients with shortages
    excesses: List[InventoryForecastItem]  # Ingredients with significant excess

class InventoryForecastResponse(BaseModel):
    restaurant_id: str
    restaurant_name: str
    forecast_summary: InventoryForecastSummary
    promotion_recommendations: List[PromotionRecommendation]
    promotable_menu_items_count: int = 0
