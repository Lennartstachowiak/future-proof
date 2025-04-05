from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.schemas.inventory import InventoryItem, InventoryResponse

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
