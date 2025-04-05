"use client";

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
import Card from "../../components/ui/Card";

type ForecastChartProps = {
  chartData: Record<string, string>[];
  uniqueItems: string[];
  getColorForItem: (itemName: string) => string;
};

export default function ForecastChart({ chartData, uniqueItems, getColorForItem }: ForecastChartProps) {
  // Calculate the maximum value for the Y-axis domain
  const calculateYAxisDomain = () => {
    // Find the maximum value in the chart data
    let maxValue = 0;
    chartData.forEach(dataPoint => {
      uniqueItems.forEach(item => {
        const value = parseInt(dataPoint[item] || '0', 10);
        if (value > maxValue) {
          maxValue = value;
        }
      });
    });
    
    // Add 20% padding to the max value to ensure bars don't touch the top
    // Also ensure the minimum max value is at least 100 for better visualization
    const paddedMax = Math.max(Math.ceil(maxValue * 1.2), 100);
    return [0, paddedMax];
  };

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold mb-4">5-Day Sales Forecast</h2>
      {/* Responsive height based on screen size */}
      <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
              height={60}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              domain={calculateYAxisDomain()}
              tickMargin={10}
              tick={{ fontSize: 12 }}
              width={50}
              padding={{ top: 10, bottom: 0 }}
              tickCount={6}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                border: '1px solid #f0f0f0'
              }}
              itemStyle={{ padding: '4px 0' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ paddingTop: '15px' }}
            />
            {uniqueItems.map((itemName) => (
              <Line
                key={itemName}
                type="monotone"
                dataKey={itemName}
                stroke={getColorForItem(itemName)}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
