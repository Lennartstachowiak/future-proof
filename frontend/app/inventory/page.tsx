"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ProgressBar from "../components/ui/ProgressBar";
import SearchBar from "../components/ui/SearchBar";
import { useRestaurant } from "../context/RestaurantContext";
import { apiGet } from "../utils/api";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  current_quantity: number;
  unit: string;
  minimum_threshold: number;
  status: "low" | "sufficient" | "excess";
};

type InventoryResponse = {
  restaurant_id: string;
  restaurant_name: string;
  items: InventoryItem[];
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { selectedRestaurant } = useRestaurant();

  useEffect(() => {
    const fetchInventory = async () => {
      if (!selectedRestaurant) return;

      try {
        setIsLoading(true);
        const data = await apiGet<InventoryResponse>(
          `api/v1/inventory/restaurant/${selectedRestaurant.id}`
        );
        setInventory(data.items);
        setError(null);
      } catch (err) {
        setError("Failed to fetch inventory data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, [selectedRestaurant]);

  const getUniqueCategories = () => {
    const categories = inventory.map((item) => item.category);
    return [...new Set(categories)];
  };

  // Convert inventory status to appropriate Badge variant
  const getStatusBadgeVariant = (
    status: string
  ): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "low":
        return "error";
      case "sufficient":
        return "success";
      case "excess":
        return "warning";
      default:
        return "info";
    }
  };

  // Convert inventory status to appropriate ProgressBar color
  const getProgressBarColor = (
    item: InventoryItem
  ): "success" | "warning" | "error" => {
    const ratio = item.current_quantity / item.minimum_threshold;
    if (ratio < 1) return "error";
    if (ratio > 2) return "warning";
    return "success";
  };

  const filteredInventory =
    selectedCategory === "all"
      ? inventory
      : inventory.filter((item) => item.category === selectedCategory);

  if (isLoading) {
    return (
      <DashboardLayout
        title="Loading..."
        subtitle="Please wait while we load your inventory data"
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
        subtitle="There was a problem loading your inventory data"
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
      title="Inventory Management"
      subtitle="Track and manage your food inventory"
    >
      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center">
          <span className="mr-3 text-sm font-[500] text-neutral-700">
            Filter by category:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[--primary-color-light] focus:border-[--primary-color-light] outline-none transition-shadow text-sm"
          >
            <option value="all">All Categories</option>
            {getUniqueCategories().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <SearchBar
          placeholder="Search inventory..."
          className="w-64"
          // Implementation would require adding search functionality
        />
      </div>

      <Card noPadding>
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Current Inventory</h2>
          <Badge variant="info">{filteredInventory.length} items</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Current Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, index) => (
                <tr
                  key={item.id}
                  className={
                    index % 2 === 0 ? "bg-[--card-background]" : "bg-[#f9fafb]"
                  }
                >
                  <td className="px-6 py-4">
                    <div className="font-[500]">{item.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-neutral-600">{item.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="mb-1 flex justify-between">
                      <span>
                        {item.current_quantity} {item.unit}
                      </span>
                      <span className="text-neutral-500 text-sm">
                        Min: {item.minimum_threshold} {item.unit}
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        (item.current_quantity / item.minimum_threshold) * 50
                      }
                      max={100}
                      color={getProgressBarColor(item)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {filteredInventory.length === 0 && (
        <Card className="mt-4">
          <div className="text-center py-4 text-neutral-500">
            No inventory items found in this category
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
