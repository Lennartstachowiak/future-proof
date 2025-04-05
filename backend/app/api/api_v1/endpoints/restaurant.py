from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.schemas.restaurant import Restaurant, RestaurantListResponse
from app.db.session import get_db
from app.db.models import Restaurant as RestaurantModel

router = APIRouter()

@router.get("/", response_model=RestaurantListResponse)
async def get_all_restaurants(db: Session = Depends(get_db)):
    """
    Get all restaurants.
    Returns a list of all restaurants with their IDs and names.
    """
    # Query all restaurants from the database
    restaurants = db.query(RestaurantModel).all()
    
    # Convert database models to Pydantic schema objects
    restaurant_list = [
        Restaurant(
            id=restaurant.id,
            name=restaurant.name
        )
        for restaurant in restaurants
    ]
    
    return RestaurantListResponse(restaurants=restaurant_list)
