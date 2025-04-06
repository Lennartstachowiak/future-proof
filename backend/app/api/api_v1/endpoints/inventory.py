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
from app.db.models import Restaurant, Inventory, Order, RestaurantOrder

router = APIRouter()


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
    
    # Get all orders for this restaurant's inventory items
    restaurant_orders = db.query(RestaurantOrder).filter(RestaurantOrder.restaurant_id == restaurant_id).all()
    order_ids = [ro.order_id for ro in restaurant_orders]
    
    # Get order details for these orders
    orders = []
    if order_ids:
        orders = db.query(Order).filter(Order.id.in_(order_ids)).all()
    
    # Create a dictionary of ordered items by inventory_id
    order_by_inventory_id = {}
    for order in orders:
        if order.inventory_id in order_by_inventory_id:
            order_by_inventory_id[order.inventory_id] += order.order_amount
        else:
            order_by_inventory_id[order.inventory_id] = order.order_amount
    
    # Map inventory items to the response schema
    items = []
    for item in inventory_items:

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

        # Get ordered amount for this inventory item (if any)
        ordered_amount = order_by_inventory_id.get(item.id, 0)
        
        # Create inventory item with additional frontend-friendly fields
        inventory_item = RestaurantInventoryItem(
            id=item.id,
            item=item.item,
            amount=item.amount,
            ordered_amount=ordered_amount,
            category=category,
            unit=item.unit
        )
        items.append(inventory_item)

    # Create and return the response
    return RestaurantInventoryResponse(
        restaurant_id=restaurant.id,
        restaurant_name=restaurant.name,
        items=items
    )
