"use client";

import { useEffect, useState } from "react";
import { apiGet } from "../../utils/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useRestaurant } from "../../context/RestaurantContext";
// Import react-icons (you may need to install this package)
import { FaArrowUp } from "react-icons/fa";

// Define types for the API response
type InventoryForecastItem = {
  id: string;  // Add ID for the inventory item
  item: string;
  current_amount: number;
  required_amount: number;
  difference: number;
  unit: string;
  menu_items: string[];
};

type PromotionRecommendation = {
  menu_item: string;
  reason: string;
  potential_quantity: number;
  ingredient_excesses: { ingredient: string; excess: string }[];
};

type InventoryForecastSummary = {
  shortages: InventoryForecastItem[];
  excesses: InventoryForecastItem[];
};

type InventoryForecastResponse = {
  restaurant_id: string;
  restaurant_name: string;
  forecast_summary: InventoryForecastSummary;
  promotion_recommendations: PromotionRecommendation[];
  promotable_menu_items_count: number;
};

export default function InventoryForecast() {
  const [forecastData, setForecastData] =
    useState<InventoryForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllShortages, setShowAllShortages] = useState(false);
  const [showAllExcesses, setShowAllExcesses] = useState(false);
  const { selectedRestaurant } = useRestaurant();

  useEffect(() => {
    const fetchInventoryForecast = async () => {
      if (!selectedRestaurant) return;

      setIsLoading(true);
      try {
        const data = await apiGet<InventoryForecastResponse>(
          `api/v1/inventory-forecast/restaurant/${selectedRestaurant.id}`
        );
        setForecastData(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching inventory forecast:", err);
        setError("Failed to fetch inventory forecast data");
        setIsLoading(false);
      }
    };

    fetchInventoryForecast();
  }, [selectedRestaurant]);

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse text-gray-500">
            Loading inventory forecast...
          </div>
        </div>
      </Card>
    );
  }

  if (error || !forecastData) {
    return (
      <Card>
        <div className="flex items-center justify-center h-48">
          <div className="text-red-500">
            {error || "No forecast data available"}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <h2 className="text-lg font-semibold mb-4">Inventory Forecast</h2>

      {/* Shortages Section */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2 text-red-600">
          Inventory Shortages
        </h3>
        {forecastData.forecast_summary.shortages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No shortages predicted for the week.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(showAllShortages
              ? forecastData.forecast_summary.shortages
              : forecastData.forecast_summary.shortages.slice(0, 6)
            ).map((item) => (
              <div
                key={item.item}
                className="border rounded-lg p-3 bg-red-50 border-red-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{item.item}</span>
                  <Badge variant="error">
                    {Math.abs(item.difference)} {item.unit} shortage
                  </Badge>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Current:</span>
                    <span>
                      {item.current_amount} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Required:</span>
                    <span>
                      {item.required_amount} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-gray-600 text-xs">
                      Used in: {item.menu_items.join(", ")}
                    </div>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1 px-2 rounded transition duration-150 ease-in-out flex items-center shadow-sm"
                      onClick={() => {
                        // This would call the reorder endpoint
                        fetch(`/api/v1/order/restaurant/${selectedRestaurant?.id}`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            inventory_id: item.id,
                            order_amount: Math.abs(item.difference)
                          })
                        })
                          .then(response => {
                            if (response.ok) {
                              alert(`Ordered ${Math.abs(item.difference)} ${item.unit} of ${item.item}`);
                            } else {
                              alert('Failed to place order');
                            }
                          })
                          .catch(error => {
                            console.error('Error placing order:', error);
                            alert('Error placing order');
                          });
                      }}
                    >
                      Reorder {Math.abs(item.difference)} {item.unit}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {forecastData.forecast_summary.shortages.length > 6 && (
              <div
                className="col-span-full text-sm text-center mt-2 cursor-pointer text-green-600 hover:text-green-800 flex justify-center items-center"
                onClick={() => setShowAllShortages(!showAllShortages)}
              >
                {showAllShortages ? (
                  <>
                    Hide {forecastData.forecast_summary.shortages.length - 6}{" "}
                    items <FaArrowUp className="ml-1" size={12} />
                  </>
                ) : (
                  <>
                    Show {forecastData.forecast_summary.shortages.length - 6}{" "}
                    more shortage items{" "}
                    <FaArrowUp
                      className="ml-1 transform rotate-180"
                      size={12}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Excesses Section */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2 text-green-600">
          Excess Inventory
        </h3>
        {forecastData.forecast_summary.excesses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No excess inventory predicted.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(showAllExcesses
              ? forecastData.forecast_summary.excesses
              : forecastData.forecast_summary.excesses.slice(0, 6)
            ).map((item) => (
              <div
                key={item.item}
                className="border rounded-lg p-3 bg-green-50 border-green-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{item.item}</span>
                  <Badge variant="success">
                    {item.difference} {item.unit} excess
                  </Badge>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Current:</span>
                    <span>
                      {item.current_amount} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Required:</span>
                    <span>
                      {item.required_amount} {item.unit}
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs mt-2">
                    Used in: {item.menu_items.join(", ")}
                  </div>
                </div>
              </div>
            ))}

            {forecastData.forecast_summary.excesses.length > 6 && (
              <div
                className="col-span-full text-sm text-center mt-2 cursor-pointer text-green-600 hover:text-green-800 flex justify-center items-center"
                onClick={() => setShowAllExcesses(!showAllExcesses)}
              >
                {showAllExcesses ? (
                  <>
                    Hide {forecastData.forecast_summary.excesses.length - 6}{" "}
                    items <FaArrowUp className="ml-1" size={12} />
                  </>
                ) : (
                  <>
                    Show {forecastData.forecast_summary.excesses.length - 6}{" "}
                    more excess items{" "}
                    <FaArrowUp
                      className="ml-1 transform rotate-180"
                      size={12}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Promotion Recommendations */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium text-purple-600">
            Promotion Recommendations
          </h3>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {forecastData.promotable_menu_items_count}{" "}
            {forecastData.promotable_menu_items_count === 1
              ? "menu item type"
              : "menu item types"}{" "}
            available for promotion
          </span>
        </div>
        {forecastData.promotion_recommendations.length === 0 ? (
          <p className="text-sm text-gray-500">
            No promotion recommendations at this time.
          </p>
        ) : (
          <div className="space-y-4">
            {forecastData.promotion_recommendations.map((recommendation) => (
              <div
                key={recommendation.menu_item}
                className="border rounded-lg p-4 bg-purple-50 border-purple-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-purple-800 text-lg">
                      {recommendation.menu_item}
                    </h4>

                    {/* Item Count - More prominent */}
                    <div className="flex items-center mt-1 my-3">
                      <div className="bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-md inline-flex items-center">
                        <FaArrowUp className="mr-1 text-purple-600" />
                        {recommendation.potential_quantity}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        items available
                      </span>
                    </div>
                  </div>

                  {/* Promotion Button */}
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center shadow-sm"
                    onClick={() => {
                      // This would link to the promotion page or open a modal
                      alert(
                        `Creating promotion for ${recommendation.menu_item}`
                      );
                    }}
                  >
                    <span className="mr-1">Start Promotion</span>
                  </button>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Excess ingredients:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.ingredient_excesses.map((excess, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        <FaArrowUp className="mr-1 text-purple-500" size={10} />
                        {excess.ingredient}: {excess.excess}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
