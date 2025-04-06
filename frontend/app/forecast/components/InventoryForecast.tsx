"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../utils/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useRestaurant } from "../../context/RestaurantContext";
import { FaArrowUp } from "react-icons/fa";

// Define types for the API response
type InventoryForecastItem = {
  id: string;
  item: string;
  current_amount: number;
  required_amount: number;
  difference: number;
  unit: string;
  menu_items: string[];
  ordered_amount: number;
};

type PromotionRecommendation = {
  menu_item: string;
  reason: string;
  potential_quantity: number;
  ingredient_excesses: { ingredient: string; excess: string }[];
  campaign_started_id?: string;
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

// Inventory type definitions
type InventoryItem = {
  id: string;
  item: string;
  amount: number;
  category: string;
  unit: string;
};

type InventoryResponse = {
  restaurant_id: string;
  restaurant_name: string;
  items: InventoryItem[];
};

// Campaign response type
type CampaignResponse = {
  id: string;
  name: string;
  message: string;
  already_exists?: boolean;
  success_count?: number;
  failed_count?: number;
  total_messages?: number;
};

export default function InventoryForecast() {
  const [forecastData, setForecastData] =
    useState<InventoryForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllShortages, setShowAllShortages] = useState(false);
  const [showAllExcesses, setShowAllExcesses] = useState(false);
  const [isProcessingReorderAll, setIsProcessingReorderAll] = useState(false);

  // Campaign modal state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] =
    useState<PromotionRecommendation | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  // Reorder all modal state
  const [showReorderAllModal, setShowReorderAllModal] = useState(false);
  const [reorderAllModalMessage, setReorderAllModalMessage] = useState("");

  // Single item reorder modal state
  const [showSingleReorderModal, setShowSingleReorderModal] = useState(false);
  const [selectedShortageItem, setSelectedShortageItem] =
    useState<InventoryForecastItem | null>(null);
  const { selectedRestaurant } = useRestaurant();

  // Function to create a new campaign with the given name
  const handleCreateCampaign = async () => {
    if (!selectedRestaurant || !campaignName.trim() || !selectedPromotion)
      return;

    setIsCreatingCampaign(true);

    try {
      // Call the API to create a new campaign with the provided name and campaign_started_id
      const response = await apiPost<CampaignResponse>(
        `api/v1/campaign/${selectedRestaurant.id}`,
        {
          name: campaignName.trim(),
          campaign_started_id: selectedPromotion.campaign_started_id,
        }
      );

      // Check if the campaign already exists
      if (response.already_exists) {
        console.log(`${response.message}
The existing campaign will be used.`);
      } else {
        // Show success message for new campaign
        console.log(`Campaign '${campaignName}' created successfully!`);
      }

      // Refresh forecast data to update promotion recommendations
      const data = await apiGet<InventoryForecastResponse>(
        `api/v1/inventory-forecast/restaurant/${selectedRestaurant.id}`
      );
      setForecastData(data);

      // Close the modal and reset state
      setShowCampaignModal(false);
      setSelectedPromotion(null);
    } catch (error) {
      console.error("Error creating campaign:", error);
      console.log("Failed to create campaign. Please try again.");
    } finally {
      setIsCreatingCampaign(false);
    }
  };

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

  // Open the reorder all modal
  const openReorderAllModal = () => {
    if (!forecastData || !selectedRestaurant) return;

    if (forecastData.forecast_summary.shortages.length === 0) {
      console.log("No shortages to reorder");
      return;
    }

    setReorderAllModalMessage(
      `Reorder all ${forecastData.forecast_summary.shortages.length} shortage items?`
    );
    setShowReorderAllModal(true);
  };

  // Handle reordering all shortage items at once
  const handleReorderAllShortages = async () => {
    if (!forecastData || isProcessingReorderAll || !selectedRestaurant) return;

    setIsProcessingReorderAll(true);

    try {
      // Get inventory data once to map names to IDs
      const inventoryData = await apiGet<InventoryResponse>(
        `/api/v1/inventory/restaurant/${selectedRestaurant.id}`
      );

      // Process each shortage item
      let successCount = 0;
      let failCount = 0;

      // Process items sequentially to avoid overwhelming the server
      for (const shortageItem of forecastData.forecast_summary.shortages) {
        try {
          // Find the inventory item with the matching name
          const inventoryItem = inventoryData.items.find(
            (invItem) => invItem.item === shortageItem.item
          );

          if (!inventoryItem) {
            console.error(`Inventory item ${shortageItem.item} not found`);
            failCount++;
            continue;
          }

          // Place the order for this item
          await apiPost(`/api/v1/order/restaurant/${selectedRestaurant.id}`, {
            inventory_id: inventoryItem.id,
            order_amount: Math.abs(shortageItem.difference),
          });

          successCount++;
        } catch (error) {
          console.error(`Error ordering ${shortageItem.item}:`, error);
          failCount++;
        }
      }

      // Show results summary
      if (successCount > 0 && failCount === 0) {
        console.log(`Successfully reordered all ${successCount} items.`);
      } else if (successCount > 0 && failCount > 0) {
        console.log(
          `Partially successful: ${successCount} items ordered, ${failCount} failed.`
        );
      } else {
        console.log("Failed to reorder any items.");
      }

      // Refresh data to show updated ordered amounts
      const data = await apiGet<InventoryForecastResponse>(
        `api/v1/inventory-forecast/restaurant/${selectedRestaurant.id}`
      );
      setForecastData(data);
    } catch (error) {
      console.error("Error processing bulk reorder:", error);
      console.log("Failed to process bulk reorder request");
    } finally {
      setIsProcessingReorderAll(false);
    }
  };

  // Open single item reorder modal
  const openSingleReorderModal = (item: InventoryForecastItem) => {
    if (!selectedRestaurant) return;
    setSelectedShortageItem(item);
    setShowSingleReorderModal(true);
  };

  // Reorder individual shortage item
  const handleReorderItem = async (item: InventoryForecastItem) => {
    if (!selectedRestaurant) return;

    try {
      // Get inventory data to find the correct inventory ID
      const inventoryData = await apiGet<InventoryResponse>(
        `/api/v1/inventory/restaurant/${selectedRestaurant.id}`
      );

      // Find the inventory item with the matching name
      const inventoryItem = inventoryData.items.find(
        (invItem) => invItem.item === item.item
      );

      if (!inventoryItem) {
        console.log(`Inventory item ${item.item} not found`);
        return;
      }

      // Place the order with the correct inventory ID
      const response = await apiPost(
        `/api/v1/order/restaurant/${selectedRestaurant.id}`,
        {
          inventory_id: inventoryItem.id,
          order_amount: Math.abs(item.difference),
        }
      );

      if (response) {
        console.log(
          `Ordered ${Math.abs(item.difference)} ${item.unit} of ${item.item}`
        );

        // Refresh data to show updated ordered amounts
        const data = await apiGet<InventoryForecastResponse>(
          `api/v1/inventory-forecast/restaurant/${selectedRestaurant.id}`
        );
        setForecastData(data);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      console.log("Failed to place order");
    }
  };

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
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium text-red-600">
            Inventory Shortages
          </h3>
          {forecastData.forecast_summary.shortages.length > 0 && (
            <button
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded transition duration-150 ease-in-out flex items-center gap-1"
              onClick={openReorderAllModal}
              disabled={isProcessingReorderAll}
            >
              {isProcessingReorderAll
                ? "Processing..."
                : "Reorder All Shortages"}
            </button>
          )}
        </div>

        {forecastData.forecast_summary.shortages.length === 0 ? (
          <p className="text-sm text-gray-500">
            No inventory shortages predicted.
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
                      {item.ordered_amount > 0 && (
                        <span className="text-green-600 ml-1">
                          (+{item.ordered_amount} {item.unit} ordered)
                        </span>
                      )}
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
                      onClick={() => openSingleReorderModal(item)}
                    >
                      Reorder {Math.abs(item.difference)} {item.unit}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {forecastData.forecast_summary.shortages.length > 6 && (
          <div
            className="text-sm text-center mt-4 cursor-pointer text-green-600 hover:text-green-800 flex justify-center items-center"
            onClick={() => setShowAllShortages(!showAllShortages)}
          >
            {showAllShortages ? (
              <>
                Hide {forecastData.forecast_summary.shortages.length - 6} items{" "}
                <FaArrowUp className="ml-1" size={12} />
              </>
            ) : (
              <>
                Show {forecastData.forecast_summary.shortages.length - 6} more
                shortage items{" "}
                <FaArrowUp className="ml-1 transform rotate-180" size={12} />
              </>
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
                      {item.ordered_amount > 0 && (
                        <span className="text-green-600 ml-1">
                          (+{item.ordered_amount} {item.unit} ordered)
                        </span>
                      )}
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
                      setSelectedPromotion(recommendation);
                      setCampaignName(
                        `${
                          recommendation.menu_item
                        } - ${new Date().toLocaleDateString()}`
                      );
                      setShowCampaignModal(true);
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
      {/* Campaign Modal */}
      {showCampaignModal && selectedPromotion && (
        <>
          {/* Modal backdrop with opacity */}
          <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
          {/* Modal content container */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-purple-800">
                Start New Promotion Campaign
              </h2>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Starting a promotion for{" "}
                  <strong>{selectedPromotion.menu_item}</strong>
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  This will create a new campaign and notify all applicable
                  customers
                </p>

                <div className="mb-4">
                  <label
                    htmlFor="campaignName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    id="campaignName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Enter campaign name"
                  />
                </div>

                <div className="mt-2 p-3 bg-purple-50 rounded-md">
                  <h3 className="text-sm font-medium text-purple-800 mb-1">
                    Promotion Details:
                  </h3>
                  <ul className="text-xs text-gray-600">
                    <li className="mb-1">
                      • Potential sales: {selectedPromotion.potential_quantity}
                    </li>
                    <li className="mb-1">
                      • Uses {selectedPromotion.ingredient_excesses.length}{" "}
                      excess ingredients
                    </li>
                    <li>• Will be sent to all applicable customers</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowCampaignModal(false);
                    setSelectedPromotion(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 bg-purple-600 text-white rounded-md ${
                    isCreatingCampaign
                      ? "opacity-75 cursor-not-allowed"
                      : "hover:bg-purple-700"
                  }`}
                  onClick={handleCreateCampaign}
                  disabled={isCreatingCampaign || !campaignName.trim()}
                >
                  {isCreatingCampaign ? "Creating..." : "Create Campaign"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Reorder All Modal */}
      {showReorderAllModal && (
        <>
          {/* Modal backdrop with opacity */}
          <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
          {/* Modal content container */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-red-700">
                Reorder All Shortages
              </h2>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">{reorderAllModalMessage}</p>

                {forecastData &&
                  forecastData.forecast_summary.shortages.length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Items to reorder:
                      </h3>
                      <div className="max-h-60 overflow-y-auto pr-2 mb-4">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th className="py-2 px-3">Item</th>
                              <th className="py-2 px-3 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {forecastData.forecast_summary.shortages.map(
                              (item) => (
                                <tr key={item.item} className="border-b">
                                  <td className="py-2 px-3">{item.item}</td>
                                  <td className="py-2 px-3 text-right">
                                    {Math.abs(item.difference)} {item.unit}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-sm text-yellow-800 mb-4">
                        <p>
                          This will place orders for all shortage items. Orders
                          will be processed immediately.
                        </p>
                      </div>
                    </>
                  )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowReorderAllModal(false)}
                >
                  Cancel
                </button>
                {forecastData &&
                  forecastData.forecast_summary.shortages.length > 0 && (
                    <button
                      className={`px-4 py-2 bg-red-600 text-white rounded-md ${
                        isProcessingReorderAll
                          ? "opacity-75 cursor-not-allowed"
                          : "hover:bg-red-700"
                      }`}
                      onClick={() => {
                        setShowReorderAllModal(false);
                        handleReorderAllShortages();
                      }}
                      disabled={isProcessingReorderAll}
                    >
                      {isProcessingReorderAll
                        ? "Processing..."
                        : "Confirm Reorder"}
                    </button>
                  )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Single Item Reorder Modal */}
      {showSingleReorderModal && selectedShortageItem && (
        <>
          {/* Modal backdrop with opacity */}
          <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
          {/* Modal content container */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4 text-red-700">
                Reorder Item
              </h2>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-gray-900">
                    {selectedShortageItem.item}
                  </span>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {Math.abs(selectedShortageItem.difference)}{" "}
                    {selectedShortageItem.unit} shortage
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Current Inventory Status:
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">
                        Current Amount
                      </div>
                      <div className="font-medium">
                        {selectedShortageItem.current_amount}{" "}
                        {selectedShortageItem.unit}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">
                        Required Amount
                      </div>
                      <div className="font-medium">
                        {selectedShortageItem.required_amount}{" "}
                        {selectedShortageItem.unit}
                      </div>
                    </div>
                  </div>

                  {selectedShortageItem.ordered_amount > 0 && (
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> You already have{" "}
                        {selectedShortageItem.ordered_amount}{" "}
                        {selectedShortageItem.unit} of this item on order.
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">
                      Order amount:{" "}
                      <strong>
                        {Math.abs(selectedShortageItem.difference)}{" "}
                        {selectedShortageItem.unit}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  Used in: {selectedShortageItem.menu_items.join(", ")}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setShowSingleReorderModal(false);
                    setSelectedShortageItem(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={() => {
                    setShowSingleReorderModal(false);
                    const item = selectedShortageItem;
                    setSelectedShortageItem(null);
                    handleReorderItem(item);
                  }}
                >
                  Confirm Reorder
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
