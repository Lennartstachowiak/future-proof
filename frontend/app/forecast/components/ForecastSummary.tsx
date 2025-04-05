"use client";

import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

// Define types locally to avoid import issues
type ForecastItem = {
  date: string;
  item_id: number;
  item_name: string;
  predicted_quantity: number;
};

type ForecastSummaryProps = {
  forecastData: ForecastItem[];
  getColorForItem?: (itemName: string) => string;
};

export default function ForecastSummary({ forecastData }: ForecastSummaryProps) {
  // Get unique items
  const uniqueItems = Array.from(new Set(forecastData.map((item) => item.item_name)));
  
  // Get tomorrow&apos;s data
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const tomorrowData = forecastData.filter((item) => item.date === tomorrowStr);

  // Calculate total predicted sales for tomorrow
  const totalTomorrowSales = tomorrowData.reduce(
    (sum, item) => sum + item.predicted_quantity,
    0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-2xl font-semibold">{uniqueItems.length}</div>
          <Badge variant="info">Items</Badge>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-gray-500">Tomorrow&apos;s Sales</h3>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-2xl font-semibold">{totalTomorrowSales}</div>
          <Badge variant="success">Items</Badge>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-gray-500">Forecast Period</h3>
        <div className="mt-1 flex items-baseline justify-between">
          <div className="text-2xl font-semibold">5 Days</div>
          <Badge variant="info">Days</Badge>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-gray-500">Top Item</h3>
        {tomorrowData.length > 0 ? (
          <>
            {(() => {
              // Find the item with highest predicted quantity
              const topItem = [...tomorrowData].sort(
                (a, b) => b.predicted_quantity - a.predicted_quantity
              )[0];
              
              return (
                <div className="mt-1 flex items-baseline justify-between">
                  <div className="text-2xl font-semibold">{topItem.item_name}</div>
                  <Badge variant="warning">{topItem.predicted_quantity}</Badge>
                </div>
              );
            })()} 
          </>
        ) : (
          <div className="mt-1 text-gray-400">No data available</div>
        )}
      </Card>
    </div>
  );
}
