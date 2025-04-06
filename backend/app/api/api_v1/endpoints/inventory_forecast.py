import json
import os
from fastapi import APIRouter, HTTPException, Depends, Path
from typing import Dict, List, Any
from sqlalchemy.orm import Session
import pandas as pd
from datetime import datetime, timedelta

from app.schemas.inventory_forecast import (
    InventoryForecastItem,
    InventoryForecastSummary,
    PromotionRecommendation,
    InventoryForecastResponse
)
from app.api.api_v1.endpoints.forecast import make_prediction_df
from app.db.session import get_db
from app.db.models import Restaurant, Inventory, Order, RestaurantOrder, Campaign

router = APIRouter()

# Load recipes data
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
RECIPES_PATH = os.path.join(BASE_DIR, "data", "recipes.json")


def load_recipes():
    """Load recipes from JSON file"""
    try:
        with open(RECIPES_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading recipes: {e}")
        return {}


def calculate_required_ingredients(menu_items: Dict[str, int], recipes: Dict[str, Any]) -> Dict[str, Dict]:
    """Calculate the required ingredients based on menu items and recipes

    Args:
        menu_items: Dictionary mapping menu item names to quantities
        recipes: Dictionary containing recipe information

    Returns:
        Dictionary mapping ingredient names to their required quantities and units
    """
    required_ingredients = {}

    for menu_item, quantity in menu_items.items():
        if menu_item not in recipes:
            continue

        for ingredient in recipes[menu_item]["ingredients"]:
            item_name = ingredient["item"]
            required_amount = ingredient["amount"] * quantity
            unit = ingredient["unit"]

            if item_name not in required_ingredients:
                required_ingredients[item_name] = {
                    "amount": required_amount,
                    "unit": unit,
                    "menu_items": [recipes[menu_item]["name"]]
                }
            else:
                required_ingredients[item_name]["amount"] += required_amount
                if recipes[menu_item]["name"] not in required_ingredients[item_name]["menu_items"]:
                    required_ingredients[item_name]["menu_items"].append(recipes[menu_item]["name"])

    return required_ingredients


@router.get("/restaurant/{restaurant_id}", response_model=InventoryForecastResponse)
async def get_inventory_forecast(
    restaurant_id: str = Path(..., description="The ID of the restaurant"),
    db: Session = Depends(get_db)
):
    """Compare inventory with forecasted sales to determine shortages or excesses.

    This endpoint combines inventory data with sales forecasts to calculate what
    ingredients are missing or in excess for the next 5 days of operations.
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
    
    # Convert inventory to dictionary for easy lookup
    current_inventory = {}
    for item in inventory_items:
        # Check if there are orders for this inventory item
        ordered_amount = order_by_inventory_id.get(item.id, 0)
        
        current_inventory[item.item] = {
            # Include both current inventory and ordered amount
            "amount": item.amount + ordered_amount,
            "unit": item.unit,
            "ordered": ordered_amount  # Track ordered amount separately for display
        }

    # Get forecast data
    forecast_df = make_prediction_df()
    if forecast_df is None or forecast_df.empty:
        raise HTTPException(status_code=404, detail="No forecast data available")

    # Load recipes
    recipes = load_recipes()
    if not recipes:
        raise HTTPException(status_code=500, detail="Could not load recipes data")

    # Aggregate required ingredients across all forecast days
    total_requirements = {}
    menu_item_quantities = {}
    
    # Process each day in the forecast
    for _, row in forecast_df.iterrows():
        # Create a dictionary of menu items and their forecasted quantities
        daily_menu_items = {
            "burger_sales": round(row["burger_sales"]),
            "salad_sales": round(row["salad_sales"]),
            "pizza_sales": round(row["pizza_sales"]),
            "ice_cream_sales": round(row["ice_cream_sales"])
        }
        
        # Keep track of total menu item quantities for promotion recommendations
        for item, qty in daily_menu_items.items():
            menu_item_quantities[item] = menu_item_quantities.get(item, 0) + qty
            
        # Calculate required ingredients for this day
        daily_required = calculate_required_ingredients(daily_menu_items, recipes)
        
        # Aggregate with existing requirements
        for item_name, required in daily_required.items():
            if item_name in total_requirements:
                total_requirements[item_name]["amount"] += required["amount"]
            else:
                total_requirements[item_name] = required.copy()
    
    # Calculate shortages and excesses
    shortage_items = []
    excess_items = []
    excess_threshold = 20  # Amount above required to be considered excess
    
    for item_name, required in total_requirements.items():
        current_amount = 0
        if item_name in current_inventory:
            current_amount = current_inventory[item_name]["amount"]
            
        difference = current_amount - required["amount"]
        
        # Get ordered amount (if any)
        ordered_amount = current_inventory[item_name].get("ordered", 0)
        
        # Create InventoryForecastItem
        forecast_item = InventoryForecastItem(
            item=item_name,
            current_amount=current_amount,
            required_amount=int(required["amount"]),
            difference=int(difference),
            unit=required["unit"],
            menu_items=required["menu_items"],
            ordered_amount=ordered_amount  # Include ordered amount for display
        )
        
        # Add to appropriate list
        if difference < 0:
            shortage_items.append(forecast_item)
        elif difference > excess_threshold:
            excess_items.append(forecast_item)
            
    # Sort shortages by severity (most negative first)
    shortage_items.sort(key=lambda x: x.difference)
    # Sort excesses by amount (most excess first)
    excess_items.sort(key=lambda x: -x.difference)
    
    # Generate promotion recommendations based on excess ingredients
    promotion_recommendations = []
    
    # Map from menu_item_key to friendly name
    menu_item_names = {
        "burger_sales": "Burger",
        "salad_sales": "Salad",
        "pizza_sales": "Pizza",
        "ice_cream_sales": "Ice Cream"
    }
    
    # Create a map of excess ingredients for quick lookup
    excess_ingredient_set = {item.item for item in excess_items}
    
    # Map menu items to their excess ingredients
    menu_item_excess_ingredients = {}
    
    # Process each menu item to check if all its ingredients are in excess
    for menu_key, friendly_name in menu_item_names.items():
        if menu_key not in recipes:
            continue
            
        menu_recipe = recipes[menu_key]
        menu_name = menu_recipe.get("name", friendly_name)
        
        # Get all ingredients for this menu item
        all_ingredients = menu_recipe.get("ingredients", [])
        if not all_ingredients:
            continue
            
        # Check if all ingredients for this menu item are in excess
        excess_ingredients = []
        all_in_excess = True
        
        for ingredient in all_ingredients:
            ingredient_name = ingredient["item"]
            
            # If any ingredient is not in excess, this menu item can't be recommended
            if ingredient_name not in excess_ingredient_set:
                all_in_excess = False
                break
                
            # Find the corresponding excess item to get the exact amount
            for excess_item in excess_items:
                if excess_item.item == ingredient_name:
                    excess_ingredients.append({
                        "ingredient": ingredient_name,
                        "excess": f"{excess_item.difference} {excess_item.unit}"
                    })
                    break
        
        # Only add menu items where ALL ingredients are in excess
        if all_in_excess and excess_ingredients:
            # Calculate potential quantity based on the limiting ingredient
            potential_quantities = []
            
            for ingredient in all_ingredients:
                ingredient_name = ingredient["item"]
                required_amount = ingredient["amount"]
                
                # Find the excess item to calculate how many menu items could be made
                for excess_item in excess_items:
                    if excess_item.item == ingredient_name:
                        # Calculate how many of this menu item we could make with this ingredient
                        potential_qty = excess_item.difference // required_amount
                        potential_quantities.append(potential_qty)
                        break
            
            # The potential quantity is limited by the ingredient with the least excess
            potential_quantity = min(potential_quantities) if potential_quantities else 0
            
            # Generate a unique campaign_started_id based on menu_item and current date
            today = datetime.now().strftime('%Y-%m-%d')
            campaign_started_id = f"{menu_name.lower().replace(' ', '_')}_{today}"
            
            # Check if a campaign with this identifier already exists
            existing_campaign = db.query(Campaign).filter(
                Campaign.restaurant_id == restaurant_id,
                Campaign.campaign_started_id == campaign_started_id
            ).first()
            
            # Only add the recommendation if no campaign with this ID exists
            if not existing_campaign:
                recommendation = PromotionRecommendation(
                    menu_item=menu_name,
                    reason=f"Can make {potential_quantity} additional items",
                    potential_quantity=potential_quantity,
                    ingredient_excesses=excess_ingredients,
                    campaign_started_id=campaign_started_id  # Add the campaign_started_id to the recommendation
                )
                promotion_recommendations.append(recommendation)
    
    # Create the summary response
    forecast_summary = InventoryForecastSummary(
        shortages=shortage_items,
        excesses=excess_items
    )
    
    # Count how many unique menu items are available for promotion
    total_promotable_menu_items = len(promotion_recommendations)
    
    return InventoryForecastResponse(
        restaurant_id=restaurant.id,
        restaurant_name=restaurant.name,
        forecast_summary=forecast_summary,
        promotion_recommendations=promotion_recommendations,
        promotable_menu_items_count=total_promotable_menu_items
    )
