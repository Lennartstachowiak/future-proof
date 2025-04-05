from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import date, timedelta
from app.schemas.forecast import ForecastResponse, ForecastItem

router = APIRouter()

@router.get("/", response_model=ForecastResponse)
async def get_forecast(days: int = 5):
    """Get forecast for the next X days"""
    # In a real implementation, this would use ML models to predict sales
    # For now, we're returning dummy data
    today = date.today()
    forecast_items = []
    
    # Generate dummy forecast data for demonstration
    menu_items = [
        {"id": 1, "name": "Burger", "category": "Main"},
        {"id": 2, "name": "Pizza", "category": "Main"},
        {"id": 3, "name": "Salad", "category": "Side"},
        {"id": 4, "name": "Ice Cream", "category": "Dessert"},
    ]
    
    for i in range(days):
        forecast_date = today + timedelta(days=i)
        for item in menu_items:
            # Simple algorithm for demo: weekends have higher sales
            is_weekend = forecast_date.weekday() >= 5
            base_quantity = 30 if is_weekend else 20
            forecast_items.append(
                ForecastItem(
                    date=forecast_date,
                    item_id=item["id"],
                    item_name=item["name"],
                    predicted_quantity=base_quantity + (item["id"] * 2) + (i * 1),
                    confidence=0.85 - (i * 0.05)  # Confidence decreases for further dates
                )
            )
    
    return ForecastResponse(items=forecast_items)
