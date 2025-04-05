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
  customers: Customer[];
};

type Campaign = {
  id: string;
  name: string;
  description: string;
  conversations: ApiConversation[];
};

type ApiConversation = {
  id: string;
  campaign_id: string;
  customer_id: string;
  customer_name: string;
  messages: ApiMessage[];
  last_message: string;
  last_updated: string;
  unread: boolean;
};

type ApiMessage = {
  id: string;
  role: string;
  message: string;
  timestamp: string;
};

type Customer = {
  id: string;
  name: string;
};

// Frontend types for inbox layout
type Conversation = {
  id: string;
  title: string; // Using customer name as title
  lastMessage: string;
  date: Date;
  unread: boolean;
  campaignId: string;
  customerId: string;
};

type Message = {
  id: string;
  conversationId: string;
  sender: string; // 'user' or 'system'
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

  // Messages mapped by conversation id
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

        // Extract all conversations from all campaigns
        const allConversations: ApiConversation[] = [];
        data.campaigns.forEach((campaign) => {
          if (campaign.conversations) {
            allConversations.push(...campaign.conversations);
          }
        });

        // Transform API conversations to frontend format
        const transformedConversations: Conversation[] = allConversations.map(
          (conv) => ({
            id: conv.id,
            title: conv.customer_name, // Using customer name as the title
            lastMessage: conv.last_message,
            date: new Date(conv.last_updated),
            unread: conv.unread,
            campaignId: conv.campaign_id,
            customerId: conv.customer_id,
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

        // Transform messages for each conversation
        const messageMap: Record<string, Message[]> = {};
        allConversations.forEach((conv) => {
          messageMap[conv.id] = conv.messages.map((msg) => ({
            id: msg.id,
            conversationId: conv.id,
            sender: msg.role, // 'user' or 'system'
            text: msg.message,
            timestamp: new Date(msg.timestamp),
          }));
        });
        setMessages(messageMap);

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
  // Sort messages by timestamp in chronological order
  const currentMessages = messages[selectedConversation] 
    ? [...messages[selectedConversation]].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    : [];

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
              {campaign.name} - {campaign.description}
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
              Customer Conversations
            </h2>
          </div>
          <div className="overflow-y-auto h-full">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conv.id ? "bg-blue-50" : ""
                } ${conv.unread ? "font-semibold" : ""}
                `}
                onClick={() => handleConversationSelect(conv.id)}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">
                    {format(conv.date, "MMM d")}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-gray-800">{conv.title}</div>
                  <div className="text-sm text-gray-500 truncate">{conv.lastMessage}</div>
                </div>
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
                  Campaign: {campaigns.find(c => c.id === currentConversation.campaignId)?.name || 'Unknown'}
                </p>
              </div>
              
              {/* Message Content */}
              <div className="flex-1 p-4 overflow-y-auto">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.sender === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <div className="font-medium mb-1">{message.sender === "user" ? "Customer" : "System"}</div>
                      <div>{message.text}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {format(message.timestamp, "h:mm a, MMM d")}
                      </div>
                    </div>
                  </div>
                ))}
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
