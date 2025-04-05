"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

type ForecastItem = {
  date: string;
  item_id: number;
  item_name: string;
  predicted_quantity: number;
  confidence: number;
};

type ForecastData = {
  items: ForecastItem[];
};

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        // In a real app, this would fetch from your actual API endpoint
        // const response = await fetch('http://localhost:8000/api/v1/forecast');
        // const data = await response.json();

        // For demonstration, using mock data
        const mockData: ForecastData = {
          items: [
            // Generate 5 days of forecast data for 4 different items
            ...Array.from({ length: 5 }, (_, dayIndex) => {
              const date = new Date();
              date.setDate(date.getDate() + dayIndex);
              const dateStr = date.toISOString().split("T")[0];

              return [
                {
                  date: dateStr,
                  item_id: 1,
                  item_name: "Burger",
                  predicted_quantity: 25 + Math.floor(Math.random() * 15),
                  confidence: 0.85 - dayIndex * 0.05,
                },
                {
                  date: dateStr,
                  item_id: 2,
                  item_name: "Pizza",
                  predicted_quantity: 30 + Math.floor(Math.random() * 20),
                  confidence: 0.87 - dayIndex * 0.04,
                },
                {
                  date: dateStr,
                  item_id: 3,
                  item_name: "Salad",
                  predicted_quantity: 15 + Math.floor(Math.random() * 10),
                  confidence: 0.82 - dayIndex * 0.05,
                },
                {
                  date: dateStr,
                  item_id: 4,
                  item_name: "Ice Cream",
                  predicted_quantity: 20 + Math.floor(Math.random() * 12),
                  confidence: 0.8 - dayIndex * 0.06,
                },
              ];
            }).flat(),
          ],
        };

        setForecastData(mockData.items);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch forecast data");
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchForecast();
  }, []);

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

  if (isLoading) {
    return (
      <DashboardLayout
        title="Loading..."
        subtitle="Please wait while we load your forecast data"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--primary-color]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Error"
        subtitle="There was a problem loading your forecast data"
      >
        <Card className="bg-red-50 border border-red-200">
          <div className="text-red-700">
            <strong className="font-[500]">Error:</strong>
            <span className="ml-2">{error}</span>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Sales Forecast"
      subtitle="Predicted sales for the next 5 days"
    >
      {/* Main chart */}
      <Card className="mb-6 overflow-hidden rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Next 5 Days Sales Prediction
          </h2>
          <Badge variant="info">
            Updated {new Date().toLocaleDateString()}
          </Badge>
        </div>

        <div className="h-80 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
            >
              <defs>
                <linearGradient id="colorBurger" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPizza" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSalad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIceCream" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f3f4f6"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                angle={0}
                textAnchor="middle"
                height={60}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                label={{
                  value: "Predicted Quantity",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#64748b", fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="Burger"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 6 }}
                fill="url(#colorBurger)"
              />
              <Line
                type="monotone"
                dataKey="Pizza"
                stroke="#4ade80"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 6 }}
                fill="url(#colorPizza)"
              />
              <Line
                type="monotone"
                dataKey="Salad"
                stroke="#facc15"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 6 }}
                fill="url(#colorSalad)"
              />
              <Line
                type="monotone"
                dataKey="Ice Cream"
                stroke="#f87171"
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 6 }}
                fill="url(#colorIceCream)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Detailed data table */}
      <Card noPadding className="shadow-sm rounded-xl overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <h2 className="text-lg font-semibold">Detailed Forecast Data</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Menu Item
                </th>
                {Array.from(new Set(forecastData.map((item) => item.date)))
                  .sort()
                  .map((date) => {
                    const dateObj = new Date(date);
                    const today = new Date();
                    const diffDays = Math.round(
                      (dateObj.getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const dayLabel =
                      diffDays === 0
                        ? "Today"
                        : `+${diffDays} day${diffDays > 1 ? "s" : ""}`;

                    return (
                      <th
                        key={date}
                        className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider"
                      >
                        <div className="flex flex-col">
                          <span>{dayLabel}</span>
                          <span className="text-[10px] font-normal normal-case mt-1 text-neutral-400">
                            {dateObj.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </th>
                    );
                  })}
              </tr>
            </thead>
            <tbody>
              {Array.from(
                new Set(forecastData.map((item) => item.item_name))
              ).map((itemName, rowIndex) => {
                const itemData = forecastData.filter(
                  (item) => item.item_name === itemName
                );

                return (
                  <tr
                    key={itemName}
                    className={
                      rowIndex % 2 === 0
                        ? "bg-[--card-background]"
                        : "bg-[#f9fafb]"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-[500] border-r border-neutral-100">
                      {itemName}
                    </td>

                    {Array.from(new Set(forecastData.map((item) => item.date)))
                      .sort()
                      .map((date) => {
                        const dataForDay = itemData.find(
                          (item) => item.date === date
                        );
                        const quantity = dataForDay
                          ? dataForDay.predicted_quantity
                          : 0;
                        const confidence = dataForDay
                          ? dataForDay.confidence
                          : 0;

                        // Different background for higher quantities
                        const bgOpacity = Math.min(
                          0.1 + (quantity / 50) * 0.25,
                          0.35
                        );
                        const bgColorStyle = {
                          backgroundColor: `rgba(79, 70, 229, ${bgOpacity})`,
                        };

                        return (
                          <td
                            key={date}
                            className="px-6 py-4 whitespace-nowrap text-sm"
                          >
                            <div className="flex justify-between items-center">
                              <div
                                className="py-2 px-3 rounded-lg font-medium text-center min-w-[70px]"
                                style={bgColorStyle}
                              >
                                {quantity.toFixed(1)}
                              </div>
                              <div className="flex items-center ml-4">
                                <span className="text-xs text-neutral-500">
                                  {(confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
