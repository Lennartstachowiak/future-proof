"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";

type PromotionItem = {
  id: number;
  item_name: string;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  description: string;
  status: "active" | "scheduled" | "expired";
};

type PromotionResponse = {
  items: PromotionItem[];
};

export default function PromotionPage() {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPromotion, setNewPromotion] = useState({
    item_name: "",
    discount_percentage: 10,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPromotionForm, setShowNewPromotionForm] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        // In a real app, this would fetch from your actual API endpoint
        // const response = await fetch('http://localhost:8000/api/v1/promotion');
        // const data = await response.json();
        
        // For demonstration, using mock data
        const today = new Date();
        const mockData: PromotionResponse = {
          items: [
            {
              id: 1,
              item_name: "Burger Special",
              discount_percentage: 15,
              start_date: new Date(today).toISOString().split('T')[0],
              end_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              description: "15% off our signature burger",
              status: "active"
            },
            {
              id: 2,
              item_name: "Pizza Monday",
              discount_percentage: 20,
              start_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              description: "20% off all pizzas every Monday",
              status: "active"
            },
            {
              id: 3,
              item_name: "Dessert Deal",
              discount_percentage: 10,
              start_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              end_date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              description: "10% off all desserts",
              status: "scheduled"
            },
          ]
        };

        setPromotions(mockData.items);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch promotion data");
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchPromotions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPromotion({ ...newPromotion, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would post to your API
    // try {
    //   const response = await fetch('http://localhost:8000/api/v1/promotion', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(newPromotion),
    //   });
    //   const data = await response.json();
    //   setPromotions([...promotions, data]);
    // } catch (err) {
    //   console.error('Failed to create promotion:', err);
    // }

    // For demonstration, just add to the local state
    const mockId = Math.max(...promotions.map(p => p.id)) + 1;
    const today = new Date();
    const startDate = new Date(newPromotion.start_date);
    
    const mockNewPromotion: PromotionItem = {
      id: mockId,
      ...newPromotion,
      status: startDate > today ? "scheduled" : "active"
    };

    setPromotions([...promotions, mockNewPromotion]);
    
    // Reset form
    setNewPromotion({
      item_name: "",
      discount_percentage: 10,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: ""
    });
  };

  const filterPromotions = () => {
    return promotions.filter(promotion => 
      promotion.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Convert promotion status to appropriate Badge variant
  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch(status) {
      case "active": return "success";
      case "scheduled": return "info";
      case "expired": return "warning";
      default: return "info";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <DashboardLayout title="Promotions" subtitle="Create and manage promotional offers">
      <div className="flex justify-between items-center mb-6">
        <SearchBar
          placeholder="Search promotions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <Button
          onClick={() => setShowNewPromotionForm(true)}
          variant="primary"
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Promotion
        </Button>
      </div>

      {showNewPromotionForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Promotion</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-[500] text-neutral-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  name="item_name"
                  value={newPromotion.item_name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[--primary-color-light] focus:border-[--primary-color-light] outline-none transition-shadow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[500] text-neutral-700 mb-1">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={newPromotion.discount_percentage}
                  onChange={(e) =>
                    setNewPromotion({
                      ...newPromotion,
                      discount_percentage: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[--primary-color-light] focus:border-[--primary-color-light] outline-none transition-shadow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[500] text-neutral-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={newPromotion.start_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[--primary-color-light] focus:border-[--primary-color-light] outline-none transition-shadow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-[500] text-neutral-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={newPromotion.end_date}
                  min={newPromotion.start_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-[--primary-color-light] focus:border-[--primary-color-light] outline-none transition-shadow"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={() => setShowNewPromotionForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Create Promotion
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card noPadding>
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Current Promotions</h2>
          <Badge variant="info">{filterPromotions().length} promotions</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb]">
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-[500] text-neutral-500 uppercase tracking-wider">
                  Period
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
              {filterPromotions().length > 0 ? (
                filterPromotions().map((promotion, index) => (
                  <tr 
                    key={promotion.id}
                    className={index % 2 === 0 ? 'bg-[--card-background]' : 'bg-[#f9fafb]'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-[500]">{promotion.item_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-[--primary-color]">{promotion.discount_percentage}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        {new Date(promotion.start_date).toLocaleDateString()} -{' '}
                        {new Date(promotion.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={getStatusBadgeVariant(promotion.status)}
                      >
                        {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => console.log('Edit promotion')}
                          variant="text"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Edit promotion"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          onClick={() => console.log('Delete promotion')}
                          variant="text"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete promotion"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    No promotions found. Create your first promotion above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
