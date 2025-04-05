/**
 * Types for the forecast page and components
 */

export type ForecastItem = {
  date: string;
  item_id: number;
  item_name: string;
  predicted_quantity: number;
};

export type ForecastData = {
  items: ForecastItem[];
};
