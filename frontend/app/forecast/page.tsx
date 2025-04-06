"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { apiGet } from "../utils/api";
import ForecastChart from "./components/ForecastChart";
import { LoadingState, ErrorState } from "./components/ForecastStatus";
import InventoryForecast from "./components/InventoryForecast";
import { ForecastItem, ForecastData } from "./types";

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async () => {
    try {
      const data = await apiGet<ForecastData>("api/v1/forecast");

      const processedData = data.items.map((item) => ({
        ...item,
        item_name: item.item_name
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        predicted_quantity: Math.round(item.predicted_quantity),
      }));

      setForecastData(processedData);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch forecast data");
      setIsLoading(false);
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const uniqueItems = Array.from(
    new Set(forecastData.map((item) => item.item_name))
  );

  const getColorForItem = (itemName: string) => {
    const colors = [
      "#4f46e5",
      "#0891b2",
      "#16a34a",
      "#ca8a04",
      "#dc2626",
      "#9333ea",
      "#2563eb",
      "#c2410c",
    ];

    const hash = itemName.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoading) {
    return (
      <LoadingState
        title="Loading..."
        subtitle="Please wait while we load your forecast data"
      />
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Transform the data for the chart
  const prepareChartData = () => {
    const dateGroups = forecastData.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = {
          date: new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        };
      }
      acc[date][item.item_name] = item.predicted_quantity.toString();
      return acc;
    }, {} as Record<string, Record<string, string>>);

    return Object.values(dateGroups);
  };

  const chartData = prepareChartData();

  return (
    <DashboardLayout
      title="Sales Forecast"
      subtitle="Predicted sales for the next 5 days"
    >
      {/* Chart */}
      <ForecastChart
        chartData={chartData}
        uniqueItems={uniqueItems}
        getColorForItem={getColorForItem}
      />

      {/* Inventory Forecast */}
      <InventoryForecast />
    </DashboardLayout>
  );
}
