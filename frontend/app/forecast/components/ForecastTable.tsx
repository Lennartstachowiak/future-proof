"use client";

import Card from "../../components/ui/Card";

// Define types locally to avoid import issues
type ForecastItem = {
  date: string;
  item_id: number;
  item_name: string;
  predicted_quantity: number;
};

type ForecastTableProps = {
  forecastData: ForecastItem[];
  getColorForItem: (itemName: string) => string;
};

export default function ForecastTable({ forecastData, getColorForItem }: ForecastTableProps) {
  // Get unique items and dates for the table
  const uniqueItems = Array.from(new Set(forecastData.map((item) => item.item_name)));
  const uniqueDates = Array.from(new Set(forecastData.map((item) => item.date))).sort();

  // Calculate background opacity based on quantity value
  const calculateBgOpacity = (quantity: number) => {
    // For larger values, adjust the scaling factor
    // This ensures that even with quantities over 100, we get reasonable opacity
    const baseOpacity = 0.1;
    const maxOpacity = 0.5;  // Increased from 0.35 to make higher values more visible
    
    // Scale based on quantity, but with diminishing returns for very large values
    const scaledOpacity = baseOpacity + Math.min(quantity / 200, 1) * (maxOpacity - baseOpacity);
    return scaledOpacity;
  };

  // Format date more responsively
  const formatDate = (dateStr: string, screenSize: 'small' | 'large' = 'large') => {
    const date = new Date(dateStr);
    
    if (screenSize === 'small') {
      // Shorter format for mobile
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    
    // Full format for larger screens
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Detailed Forecast</h2>
      <div className="overflow-x-auto -mx-4 sm:-mx-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10"
              >
                Item
              </th>
              {uniqueDates.map((date) => {
                return (
                  <th
                    key={date}
                    scope="col"
                    className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <span className="hidden sm:inline">{formatDate(date)}</span>
                    <span className="sm:hidden">{formatDate(date, 'small')}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {uniqueItems.map((itemName, rowIndex) => {
              const itemData = forecastData.filter(
                (item) => item.item_name === itemName
              );

              return (
                <tr key={itemName} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap sticky left-0 z-10" style={{ backgroundColor: rowIndex % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: getColorForItem(itemName) }}
                      ></div>
                      <span className="font-medium truncate max-w-[120px] sm:max-w-full" title={itemName}>
                        {itemName}
                      </span>
                    </div>
                  </td>

                  {uniqueDates.map((date) => {
                    const dataForDay = itemData.find(
                      (item) => item.date === date
                    );
                    const quantity = dataForDay
                      ? dataForDay.predicted_quantity
                      : 0;

                    // Calculate background opacity based on quantity
                    const bgOpacity = calculateBgOpacity(quantity);

                    return (
                      <td
                        key={date}
                        className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm"
                      >
                        <div className="flex justify-center sm:justify-between items-center">
                          <div
                            className="py-1 sm:py-2 px-2 sm:px-3 rounded-lg font-medium text-center w-16 sm:min-w-[70px]"
                            style={{
                              backgroundColor: `rgba(79, 70, 229, ${bgOpacity})`,
                            }}
                          >
                            {quantity}
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
      
      {/* Mobile-friendly summary for small screens */}
      <div className="block sm:hidden mt-6 space-y-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Mobile Summary View</h3>
        {uniqueItems.map((itemName) => {
          const itemData = forecastData.filter(
            (item) => item.item_name === itemName
          );
          
          // Calculate total predicted quantity for this item
          const totalQuantity = itemData.reduce((sum, item) => sum + item.predicted_quantity, 0);
          
          return (
            <div key={itemName} className="border rounded-lg p-3">
              <div className="flex items-center mb-2">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getColorForItem(itemName) }}
                ></div>
                <span className="font-medium">{itemName}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {uniqueDates.map((date) => {
                  const dataForDay = itemData.find((item) => item.date === date);
                  const quantity = dataForDay ? dataForDay.predicted_quantity : 0;
                  const bgOpacity = calculateBgOpacity(quantity);
                  
                  return (
                    <div key={date} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">{formatDate(date, 'small')}</div>
                      <div 
                        className="py-1 px-1 rounded-md font-medium text-center text-sm"
                        style={{
                          backgroundColor: `rgba(79, 70, 229, ${bgOpacity})`,
                        }}
                      >
                        {quantity}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-right text-sm font-medium">
                Total: {totalQuantity}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
