// NOTE: Ensure you have installed date-fns by running:

"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { format } from "date-fns";
import { useRestaurant } from "../context/RestaurantContext";
import { apiGet } from "../utils/api";

// API response types
type RestaurantCampaignResponse = {
  restaurant_id: string;
  restaurant_name: string;
  campaigns: Campaign[];
  conversations: ApiConversation[];
  users: User[];
};

type Campaign = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
};

type ApiConversation = {
  id: string;
  title: string;
  campaign_id: string;
  last_message: string;
  last_message_date: string;
  participants: string[];
};

type User = {
  id: string;
  name: string;
  role: string;
};

// Frontend types for inbox layout
type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  date: Date;
  unread: boolean;
  participants: string[];
  campaignId: string;
};

type Message = {
  id: string;
  conversationId: string;
  sender: string;
  text: string;
  timestamp: Date;
};

export default function PromotionPage() {
  // State for API data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Campaign selection state
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");

  // Get the selected restaurant from context
  const { selectedRestaurant } = useRestaurant();

  // Define new function for starting a new campaign (empty for now)
  const handleNewCampaign = () => {
    // TODO: implement functionality for starting a new campaign
  };

  // Frontend conversations state (transformed from API data)
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Sample messages mapped by conversation id (would come from API in a real app)
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  const [selectedConversation, setSelectedConversation] = useState<string>("");

  // Fetch campaign data when the selected restaurant changes
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!selectedRestaurant) return;

      try {
        setIsLoading(true);
        const data = await apiGet<RestaurantCampaignResponse>(
          `api/v1/promotion/restaurant/${selectedRestaurant.id}`
        );

        // Set campaigns from API
        setCampaigns(data.campaigns);

        // Transform API conversations to frontend format
        const transformedConversations: Conversation[] = data.conversations.map(
          (conv) => ({
            id: conv.id,
            title: conv.title,
            lastMessage: conv.last_message,
            date: new Date(conv.last_message_date),
            unread: false, // This would come from user state in a real app
            participants: conv.participants,
            campaignId: conv.campaign_id,
          })
        );

        setConversations(transformedConversations);

        // Set initial selected campaign if available
        if (data.campaigns.length > 0 && !selectedCampaign) {
          setSelectedCampaign(data.campaigns[0].id);
        }

        // Set initial selected conversation if available
        if (transformedConversations.length > 0 && !selectedConversation) {
          setSelectedConversation(transformedConversations[0].id);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching campaign data:", err);
        setError("Failed to load campaign data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignData();
  }, [selectedRestaurant, selectedCampaign, selectedConversation]);

  // Filter conversations by currently selected campaign
  const filteredConversations = conversations.filter(
    (conv) => conv.campaignId === selectedCampaign
  );

  // Handle campaign change: update selectedCampaign and reset selectedConversation if needed
  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCampaign = e.target.value;
    setSelectedCampaign(newCampaign);
    const convs = conversations.filter((c) => c.campaignId === newCampaign);
    setSelectedConversation(convs.length > 0 ? convs[0].id : "");
  };

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id);
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, unread: false } : conv))
    );
  };

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  );
  const currentMessages = messages[selectedConversation] || [];

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Promotions" subtitle="Loading campaign data...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--primary-color]"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout
        title="Promotions"
        subtitle="Error loading campaign data"
      >
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <p className="mt-2">
            Please try again later or contact support if the problem persists.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // No campaigns state
  if (campaigns.length === 0) {
    return (
      <DashboardLayout title="Promotions" subtitle="No campaigns found">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">
            No campaigns found for this restaurant.
          </p>
          <button
            onClick={handleNewCampaign}
            className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create your first campaign
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Promotions"
      subtitle="Manage your promotional conversations"
    >
      <div className="mb-4 flex items-center space-x-2">
        <select
          value={selectedCampaign}
          onChange={handleCampaignChange}
          className="p-2 border border-gray-300 rounded"
        >
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleNewCampaign}
          className="p-2 border border-blue-500 rounded text-blue-500 hover:bg-blue-50"
        >
          Start new Campaign
        </button>
      </div>
      <div className="flex h-[calc(100vh-180px)] bg-white rounded-lg shadow overflow-hidden">
        {/* Left Sidebar: Conversations List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Conversations
            </h2>
          </div>
          <div className="overflow-y-auto h-full">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conv.id ? "bg-blue-50" : ""
                }`}
                onClick={() => handleConversationSelect(conv.id)}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900">
                    {conv.title}
                    {conv.unread && (
                      <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                    )}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {format(conv.date, "MMM d")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessage}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {conv.participants.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Messages */}
        <div className="w-2/3 flex flex-col">
          {currentConversation ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  {currentConversation.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentConversation.participants.join(", ")}
                </p>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "You" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-xs ${
                        msg.sender === "You"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {format(msg.timestamp, "p")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200">
                <input
                  type="text"
                  placeholder="Type a message"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">
                Select a conversation to view messages
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
