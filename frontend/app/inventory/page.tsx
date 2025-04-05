"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import ProgressBar from "../components/ui/ProgressBar";
import StatsCard from "../components/ui/StatsCard";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  current_quantity: number;
  unit: string;
  minimum_threshold: number;
  status: "low" | "sufficient" | "excess";
};

type InventoryResponse = {
  items: InventoryItem[];
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // In a real app, this would fetch from your actual API endpoint
        // const response = await fetch('http://localhost:8000/api/v1/inventory');
        // const data = await response.json();
        
        // For demonstration, using mock data
        const mockData: InventoryResponse = {
          items: [
            {
              id: 1,
              name: "Flour",
              category: "Dry Goods",
              current_quantity: 50.5,
              unit: "kg",
              minimum_threshold: 10.0,
              status: "sufficient"
            },
            {
              id: 2,
              name: "Sugar",
              category: "Dry Goods",
              current_quantity: 12.3,
              unit: "kg",
              minimum_threshold: 5.0,
              status: "sufficient"
            },
            {
              id: 3,
              name: "Tomatoes",
              category: "Produce",
              current_quantity: 15.2,
              unit: "kg",
              minimum_threshold: 5.0,
              status: "sufficient"
            },
            {
              id: 4,
              name: "Lettuce",
              category: "Produce",
              current_quantity: 6.8,
              unit: "kg",
              minimum_threshold: 4.0,
              status: "sufficient"
            },
            {
              id: 5,
              name: "Chicken Breast",
              category: "Meat",
              current_quantity: 8.7,
              unit: "kg",
              minimum_threshold: 10.0,
              status: "low"
            },
            {
              id: 6,
              name: "Ground Beef",
              category: "Meat",
              current_quantity: 12.5,
              unit: "kg",
              minimum_threshold: 8.0,
              status: "sufficient"
            },
            {
              id: 7,
              name: "Milk",
              category: "Dairy",
              current_quantity: 5.0,
              unit: "L",
              minimum_threshold: 10.0,
              status: "low"
            },
            {
              id: 8,
              name: "Cheese",
              category: "Dairy",
              current_quantity: 7.2,
              unit: "kg",
              minimum_threshold: 3.0,
              status: "sufficient"
            },
            {
              id: 9,
              name: "Ice Cream",
              category: "Frozen",
              current_quantity: 25.0,
              unit: "L",
              minimum_threshold: 10.0,
              status: "excess"
            },
            {
              id: 10,
              name: "Frozen Vegetables",
              category: "Frozen",
              current_quantity: 18.4,
              unit: "kg",
              minimum_threshold: 15.0,
              status: "sufficient"
            },
          ]
        };

        setInventory(mockData.items);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch inventory data");
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchInventory();
  }, []);

  const getUniqueCategories = () => {
    const categories = inventory.map(item => item.category);
    return [...new Set(categories)];
  };

  // Convert inventory status to appropriate Badge variant
  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch(status) {
      case "low": return "error";
      case "sufficient": return "success";
      case "excess": return "warning";
      default: return "info";
    }
  };
  
  // Convert inventory status to appropriate ProgressBar color
  const getProgressBarColor = (item: InventoryItem): 'success' | 'warning' | 'error' => {
    const ratio = item.current_quantity / item.minimum_threshold;
    if (ratio < 1) return 'error';
    if (ratio > 2) return 'warning';
    return 'success';
  };

  const filteredInventory = selectedCategory === "all" 
    ? inventory
    : inventory.filter(item => item.category === selectedCategory);

  // Count items by status
  const lowItems = inventory.filter(item => item.status === "low").length;
  const sufficientItems = inventory.filter(item => item.status === "sufficient").length;
  const excessItems = inventory.filter(item => item.status === "excess").length;

  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." subtitle="Please wait while we load your inventory data">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--primary-color]"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error" subtitle="There was a problem loading your inventory data">
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
    <DashboardLayout title="Inventory Management" subtitle="Track and manage your food inventory">
      {/* Inventory Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <StatsCard
          title="Low Stock Items"
          value={lowItems}
          subtext="Need attention"
          gradient="pink-orange"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />
        
        <StatsCard
          title="Sufficient Stock"
          value={sufficientItems}
          subtext="Optimal levels"
          gradient="blue-cyan"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Excess Stock"
          value={excessItems}
          subtext="Consider promotions"
          gradient="none"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center">
          <span className="mr-3 text-sm font-[500] text-neutral-700">Filter by category:</span>
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
                  className={index % 2 === 0 ? 'bg-[--card-background]' : 'bg-[#f9fafb]'}
                >
                  <td className="px-6 py-4">
                    <div className="font-[500]">{item.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-neutral-600">{item.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="mb-1 flex justify-between">
                      <span>{item.current_quantity} {item.unit}</span>
                      <span className="text-neutral-500 text-sm">Min: {item.minimum_threshold} {item.unit}</span>
                    </div>
                    <ProgressBar
                      value={(item.current_quantity / item.minimum_threshold) * 50}
                      max={100}
                      color={getProgressBarColor(item)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                    >
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
