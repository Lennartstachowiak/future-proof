"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,

} from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import StatsCard from "../components/ui/StatsCard";
import ProgressBar from "../components/ui/ProgressBar";
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

  // Calculate some summary stats from the data for dashboard metrics
  const calculateSummaryStats = () => {
    // Skip if data not loaded yet
    if (forecastData.length === 0) return { totalItems: 0, avgConfidence: 0, trendDirection: 'stable' };
    
    // Count total predicted items
    const totalItems = forecastData.reduce((sum, item) => sum + item.predicted_quantity, 0);
    
    // Calculate average confidence
    const avgConfidence = forecastData.reduce((sum, item) => sum + item.confidence, 0) / forecastData.length;
    
    // Determine if trend is up or down (comparing first day to last day)
    const dates = [...new Set(forecastData.map(item => item.date))].sort();
    if (dates.length >= 2) {
      const firstDayItems = forecastData.filter(item => item.date === dates[0]);
      const lastDayItems = forecastData.filter(item => item.date === dates[dates.length - 1]);
      
      const firstDayTotal = firstDayItems.reduce((sum, item) => sum + item.predicted_quantity, 0);
      const lastDayTotal = lastDayItems.reduce((sum, item) => sum + item.predicted_quantity, 0);
      
      const trendDirection = lastDayTotal > firstDayTotal * 1.1 ? 'up' : 
                            lastDayTotal < firstDayTotal * 0.9 ? 'down' : 'stable';
      
      return { totalItems, avgConfidence, trendDirection };
    }
    
    return { totalItems, avgConfidence, trendDirection: 'stable' };
  };
  
  const { totalItems, trendDirection } = calculateSummaryStats();
  // Note: avgConfidence is available but we're not using it in this version
  
  // Get top selling item
  const getTopSellingItem = () => {
    if (forecastData.length === 0) return null;
    
    const itemTotals = forecastData.reduce((acc, item) => {
      acc[item.item_name] = (acc[item.item_name] || 0) + item.predicted_quantity;
      return acc;
    }, {} as Record<string, number>);
    
    let topItem = '';
    let maxQuantity = 0;
    
    for (const [item, quantity] of Object.entries(itemTotals)) {
      if (quantity > maxQuantity) {
        maxQuantity = quantity;
        topItem = item;
      }
    }
    
    return { name: topItem, quantity: maxQuantity };
  };
  
  const topSeller = getTopSellingItem();
  
  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Please wait while we load your forecast data">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--primary-color]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error" subtitle="There was a problem loading your forecast data">
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
    <DashboardLayout title="Sales Forecast" subtitle="Predicted sales for the next 5 days">
      {/* Summary metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatsCard
          title="Total Predicted Items"
          value={Math.round(totalItems)}
          subtext="Next 5 days"
          gradient="pink-orange"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Top Selling Item"
          value={topSeller ? topSeller.name : "-"}
          subtext={topSeller ? `${Math.round(topSeller.quantity)} units expected` : "No data"}
          gradient="blue-cyan"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Sales Trend"
          value={trendDirection === 'up' ? '↗️ Increasing' : trendDirection === 'down' ? '↘️ Decreasing' : '→ Stable'}
          subtext={"Based on 5-day prediction"}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />
      </div>

      {/* Main chart */}
      <Card className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Next 5 Days Sales Prediction</h2>
          <Badge variant="info">Updated {new Date().toLocaleDateString()}</Badge>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                label={{ 
                  value: "Predicted Quantity", 
                  angle: -90, 
                  position: "insideLeft", 
                  style: { fill: '#64748b', fontSize: 12 } 
                }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="Burger" fill="#8884d8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pizza" fill="#4ade80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Salad" fill="#facc15" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ice Cream" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Confidence levels */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Prediction Confidence Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from(new Set(forecastData.map(item => item.item_name))).map(itemName => {
            const item = forecastData.find(item => item.item_name === itemName);
            if (!item) return null;
            
            return (
              <div key={itemName} className="p-4 border border-neutral-100 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-[500]">{itemName}</span>
                  <span className="text-sm text-neutral-500">{(item.confidence * 100).toFixed(0)}% confidence</span>
                </div>
                <ProgressBar 
                  value={item.confidence * 100} 
                  color={item.confidence > 0.8 ? 'success' : item.confidence > 0.6 ? 'warning' : 'error'}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Detailed data table */}
      <Card noPadding>
        <div className="p-5 border-b border-neutral-100">
          <h2 className="text-lg font-semibold">Detailed Forecast Data</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Predicted Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody>
              {forecastData.map((item, index) => (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? 'bg-[--card-background]' : 'bg-[#f9fafb]'}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-[500]">
                    {item.item_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.predicted_quantity.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ProgressBar
                        value={item.confidence * 100}
                        size="sm"
                        color={item.confidence > 0.8 ? 'success' : item.confidence > 0.6 ? 'warning' : 'error'}
                        className="w-24 mr-2"
                      />
                      <span className="text-sm">
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
