from fastapi import APIRouter, HTTPException, Depends, Path
from typing import List
from sqlalchemy.orm import Session

from app.schemas.inventory import (
    InventoryItem, 
    InventoryResponse, 
    RestaurantInventoryItem,
    RestaurantInventoryResponse
)
from app.db.session import get_db
from app.db.models import Restaurant, Inventory

router = APIRouter()

@router.get("/", response_model=InventoryResponse)
async def get_inventory():
    """Get current inventory"""
    # This would normally fetch from the database
    # For now, returning dummy data
    items = [
        InventoryItem(
            id=1,
            name="Flour",
            category="Dry Goods",
            current_quantity=50.5,
            unit="kg",
            minimum_threshold=10.0,
            status="sufficient"
        ),
        InventoryItem(
            id=2,
            name="Tomatoes",
            category="Produce",
            current_quantity=15.2,
            unit="kg",
            minimum_threshold=5.0,
            status="sufficient"
        ),
        InventoryItem(
            id=3,
            name="Chicken Breast",
            category="Meat",
            current_quantity=8.7,
            unit="kg",
            minimum_threshold=10.0,
            status="low"
        ),
        InventoryItem(
            id=4,
            name="Milk",
            category="Dairy",
            current_quantity=5.0,
            unit="L",
            minimum_threshold=10.0,
            status="low"
        ),
    ]
    
    return InventoryResponse(items=items)

@router.get("/{item_id}", response_model=InventoryItem)
async def get_inventory_item(item_id: int):
    """Get a specific inventory item"""
    # Dummy data - in a real implementation this would come from a database
    items = {
        1: InventoryItem(
            id=1,
            name="Flour",
            category="Dry Goods",
            current_quantity=50.5,
            unit="kg",
            minimum_threshold=10.0,
            status="sufficient"
        ),
        2: InventoryItem(
            id=2,
            name="Tomatoes",
            category="Produce",
            current_quantity=15.2,
            unit="kg",
            minimum_threshold=5.0,
            status="sufficient"
        ),
        3: InventoryItem(
            id=3,
            name="Chicken Breast",
            category="Meat",
            current_quantity=8.7,
            unit="kg",
            minimum_threshold=10.0,
            status="low"
        ),
        4: InventoryItem(
            id=4,
            name="Milk",
            category="Dairy",
            current_quantity=5.0,
            unit="L",
            minimum_threshold=10.0,
            status="low"
        ),
    }
    
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return items[item_id]

@router.get("/restaurant/{restaurant_id}", response_model=RestaurantInventoryResponse)
async def get_restaurant_inventory(
    restaurant_id: str = Path(..., description="The ID of the restaurant"),
    db: Session = Depends(get_db)
):
    """
    Get inventory data for a specific restaurant.
    Returns all inventory items for the specified restaurant.
    """
    # Check if restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get all inventory items for this restaurant
    inventory_items = db.query(Inventory).filter(Inventory.restaurant_id == restaurant_id).all()
    
    # Map inventory items to the response schema
    items = []
    for item in inventory_items:
        # Determine status based on amount (this logic can be customized)
        status = "sufficient"
        if item.amount < 10:
            status = "low"
        elif item.amount > 50:
            status = "excess"
        
        # Map categories based on item name (this is a simple example)
        category = "Other"
        if any(meat in item.item.lower() for meat in ["beef", "chicken", "pork", "patties"]):
            category = "Meat"
        elif any(produce in item.item.lower() for produce in ["lettuce", "tomato", "onion", "strawberries"]):
            category = "Produce"
        elif any(dairy in item.item.lower() for dairy in ["cheese", "milk", "cream", "yogurt"]):
            category = "Dairy"
        elif any(grain in item.item.lower() for grain in ["flour", "dough", "buns", "bread"]):
            category = "Bakery"
        elif any(sauce in item.item.lower() for sauce in ["sauce", "syrup"]):
            category = "Condiments"
        
        # Create inventory item with additional frontend-friendly fields
        inventory_item = RestaurantInventoryItem(
            id=item.id,
            item=item.item,
            amount=item.amount,
            status=status,
            category=category,
            unit="units"  # Default unit, could be customized based on item type
        )
        items.append(inventory_item)
    
    # Create and return the response
    return RestaurantInventoryResponse(
        restaurant_id=restaurant.id,
        restaurant_name=restaurant.name,
        items=items
    )
