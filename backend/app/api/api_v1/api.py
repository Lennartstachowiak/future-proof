from fastapi import APIRouter

from app.api.api_v1.endpoints import forecast, inventory, promotion, restaurant

api_router = APIRouter()
api_router.include_router(forecast.router, prefix="/forecast", tags=["forecast"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(promotion.router, prefix="/promotion", tags=["promotion"])
api_router.include_router(restaurant.router, prefix="/restaurant", tags=["restaurant"])
