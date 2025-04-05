from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import date, timedelta
from app.schemas.forecast import ForecastResponse, ForecastItem
import pandas as pd
import numpy as np
import pickle
import requests
import json
import sklearn

# Step 2: Fetch weather data from Open-Meteo API


def fetch_weather_data():
    """Fetch weather data from Open-Meteo API"""

    url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=sunshine_duration,rain_sum,snowfall_sum,temperature_2m_mean&hourly=temperature_2m"

    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching data: {response.status_code}")
            return None
    except Exception as e:
        print(f"Exception occurred: {e}")
        return None

# Step 3: Process the weather data


def process_weather_data(data):
    """Process the weather data to the format needed for predictions"""
    if not data:
        print("No weather data to process")
        return None

    # Extract daily data
    daily_data = pd.DataFrame()
    daily_data['Date'] = pd.to_datetime(data['daily']['time'])
    daily_data['temperature_2m_mean'] = data['daily']['temperature_2m_mean']
    daily_data['sunshine_duration'] = data['daily']['sunshine_duration']
    daily_data['rain_sum'] = data['daily']['rain_sum']
    daily_data['snowfall_sum'] = data['daily']['snowfall_sum']

    # Extract month and day features
    daily_data['month'] = daily_data['Date'].dt.month
    daily_data['day_of_week'] = daily_data['Date'].dt.dayofweek
    daily_data['day_of_month'] = daily_data['Date'].dt.day

    # Since we don't have weather_description, we'll approximate it based on temperature and precipitation
    # This is a simplification and might need adjustment based on your model's training data
    conditions = [
        (daily_data['rain_sum'] > 5.0),
        (daily_data['rain_sum'] > 0.0) & (daily_data['rain_sum'] <= 5.0),
        (daily_data['snowfall_sum'] > 0.0),
        (daily_data['temperature_2m_mean'] < 0),
        (daily_data['sunshine_duration'] > 30000),
        (daily_data['sunshine_duration'] > 10000) & (daily_data['sunshine_duration'] <= 30000)
    ]

    choices = ['Rain', 'Light Drizzle', 'Snow', 'Light Snow', 'Sunny', 'Mainly Sunny']
    daily_data['weather_description'] = np.select(conditions, choices, default='Cloudy')

    # One-hot encode weather_description
    daily_data_encoded = pd.get_dummies(daily_data, columns=['weather_description'], drop_first=False)

    return daily_data_encoded

# Step 4: Make predictions


def predict_sales(processed_data):
    """Make sales predictions based on weather data"""

    food_items = ['burger_sales', 'salad_sales', 'pizza_sales', 'ice_cream_sales']
    models = {}

    for item in food_items:
        model_filename = f'app/api/api_v1/endpoints/models/{item}_gradientboosting_model.pkl'
        try:
            with open(model_filename, 'rb') as f:
                models[item] = pickle.load(f)
            # print(f"Loaded model for {item}")
        except FileNotFoundError:
            print(f"Warning: Model file {model_filename} not found")

    if processed_data is None or not models:
        print("Cannot make predictions: missing data or models")
        return None

    # Select only the features needed for prediction
    required_features = set()
    for item in food_items:
        if item in models:
            required_features.update(models[item].feature_names_in_)

    # Check if all required features are present
    missing_features = required_features - set(processed_data.columns)
    if missing_features:
        # print(f"Warning: Missing features: {missing_features}")
        # Add missing features with default values (0)
        for feature in missing_features:
            processed_data[feature] = 0

    # Make predictions for each food item
    predictions = {}
    for item, model in models.items():
        # Make sure the features are in the right order
        pred_data = processed_data[model.feature_names_in_]
        predictions[item] = model.predict(pred_data)

    # Add predictions to the data
    result_df = processed_data[['Date']].copy()
    for item in food_items:
        if item in models:
            result_df[item] = predictions[item]

    return result_df

# Main function to run everything


def make_prediction_df():

    # Use the weather data from the API
    weather_data = fetch_weather_data()

    # Process the weather data
    processed_data = process_weather_data(weather_data)

    if processed_data is not None:
        # print("\nProcessed Weather Data:")
        # print(processed_data[['Date', 'temperature_2m_mean', 'sunshine_duration', 'rain_sum', 'snowfall_sum']].head())

        # Make predictions
        predictions_df = predict_sales(processed_data)
    else:
        print("No processed data to make predictions")
        return None

    return predictions_df


router = APIRouter()


@router.get("/", response_model=ForecastResponse)
async def get_forecast():
    """Get forecast for the next X days"""
    results = make_prediction_df()
    if results is None:
        raise HTTPException(status_code=500, detail="Error processing forecast data")
    if results.empty:
        raise HTTPException(status_code=404, detail="No forecast data available")

    forecast_items = []
    food_items = ['burger_sales', 'salad_sales', 'pizza_sales', 'ice_cream_sales']
    # Iterate over each row (date)
    for _, row in results.iterrows():
        for item in food_items:
            forecast_items.append(
                ForecastItem(
                    date=row["Date"].date(),
                    item_id=hash(f"{row['Date']}_{item}"),
                    item_name=item,
                    predicted_quantity=row[item]
                )
            )

    return ForecastResponse(items=forecast_items)
