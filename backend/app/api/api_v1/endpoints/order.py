from fastapi import APIRouter, HTTPException, Depends, Path, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.models import Restaurant, Inventory, Order, RestaurantOrder
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse

router = APIRouter()


@router.post("/restaurant/{restaurant_id}", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate, restaurant_id: str = Path(...), db: Session = Depends(get_db)):
    """
    Create a new order for a specific restaurant.
    
    This endpoint allows creating an order for inventory items that are low in stock.
    It records the order amount and associates it with the restaurant and inventory item.
    """
    # Check if restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
        
    # Check if inventory item exists and belongs to this restaurant
    inventory_item = db.query(Inventory).filter(
        Inventory.id == order.inventory_id,
        Inventory.restaurant_id == restaurant_id
    ).first()
    
    if not inventory_item:
        raise HTTPException(
            status_code=404, 
            detail="Inventory item not found or doesn't belong to this restaurant"
        )
    
    # Create the order
    new_order = Order(
        inventory_id=order.inventory_id,
        order_amount=order.order_amount
    )
    
    db.add(new_order)
    db.flush()  # Flush to get the order ID
    
    # Create the restaurant-order association
    restaurant_order = RestaurantOrder(
        restaurant_id=restaurant_id,
        order_id=new_order.id
    )
    
    db.add(restaurant_order)
    db.commit()
    db.refresh(new_order)
    
    # Return the order with item details
    return OrderResponse(
        id=new_order.id,
        inventory_id=new_order.inventory_id,
        order_amount=new_order.order_amount,
        created_at=new_order.created_at,
        updated_at=new_order.updated_at,
        item_name=inventory_item.item,
        unit=inventory_item.unit
    )


@router.get("/restaurant/{restaurant_id}", response_model=OrderListResponse)
async def list_restaurant_orders(restaurant_id: str = Path(...), db: Session = Depends(get_db)):
    """
    List all orders for a specific restaurant.
    
    This endpoint returns all orders associated with a restaurant, including
    details about the ordered inventory items.
    """
    # Check if restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get all orders for this restaurant
    restaurant_orders = db.query(RestaurantOrder).filter(
        RestaurantOrder.restaurant_id == restaurant_id
    ).all()
    
    # Collect all order IDs
    order_ids = [ro.order_id for ro in restaurant_orders]
    
    # Get the orders with their inventory items
    orders_with_items = (
        db.query(Order, Inventory)
        .join(Inventory, Order.inventory_id == Inventory.id)
        .filter(Order.id.in_(order_ids))
        .all()
    )
    
    # Prepare the response
    order_responses = [
        OrderResponse(
            id=order.id,
            inventory_id=order.inventory_id,
            order_amount=order.order_amount,
            created_at=order.created_at,
            updated_at=order.updated_at,
            item_name=inventory.item,
            unit=inventory.unit
        ) 
        for order, inventory in orders_with_items
    ]
    
    return OrderListResponse(orders=order_responses)
