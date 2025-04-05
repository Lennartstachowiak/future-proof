// NOTE: Ensure you have installed date-fns by running:   

"use client";

import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { format } from "date-fns";

// Keep the existing types for future use
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

// New types for inbox layout
type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  date: Date;
  unread: boolean;
  participants: string[];
  campaignId: string; // added property
};

type Message = {
  id: string;
  conversationId: string;
  sender: string;
  text: string;
  timestamp: Date;
};

// Define sample campaigns
const campaigns = [
  { id: "camp1", name: "Campaign 1" },
  { id: "camp2", name: "Campaign 2" },
  { id: "camp3", name: "Campaign 3" }
];

export default function PromotionPage() {
  // Campaign selection state
  const [selectedCampaign, setSelectedCampaign] = useState<string>("camp1");

  // Define new function for starting a new campaign (empty for now)
  const handleNewCampaign = () => {
    // TODO: implement functionality for starting a new campaign
  };

  // Sample conversations data with campaignId
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "New Burger Promotion",
      lastMessage: "Great! Let's launch this next week.",
      date: new Date(2023, 6, 12),
      unread: true,
      participants: ["Alex", "You"],
      campaignId: "camp1"
    },
    {
      id: "2",
      title: "Summer Drink Specials",
      lastMessage: "Could we add more tropical options?",
      date: new Date(2023, 6, 10),
      unread: false,
      participants: ["Marketing Team", "You"],
      campaignId: "camp1"
    },
    {
      id: "3",
      title: "Loyalty Program Update",
      lastMessage: "The new rewards structure looks promising.",
      date: new Date(2023, 6, 8),
      unread: false,
      participants: ["Sarah", "You", "Dev Team"],
      campaignId: "camp2"
    },
    {
      id: "4",
      title: "Weekend Special Planning",
      lastMessage: "Let's finalize the menu by Thursday.",
      date: new Date(2023, 6, 5),
      unread: false,
      participants: ["Kitchen", "You"],
      campaignId: "camp3"
    }
  ]);

  // Sample messages mapped by conversation id
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    "1": [
      {
        id: "101",
        conversationId: "1",
        sender: "Alex",
        text: "I've been thinking about a new burger promotion for next month.",
        timestamp: new Date(2023, 6, 12, 9, 30)
      },
      {
        id: "102",
        conversationId: "1",
        sender: "You",
        text: "That sounds interesting. What do you have in mind?",
        timestamp: new Date(2023, 6, 12, 9, 45)
      },
      {
        id: "103",
        conversationId: "1",
        sender: "Alex",
        text: "I was thinking a gourmet burger with customizable toppings.",
        timestamp: new Date(2023, 6, 12, 10, 0)
      },
      {
        id: "104",
        conversationId: "1",
        sender: "You",
        text: "Great! Let's launch this next week.",
        timestamp: new Date(2023, 6, 12, 10, 15)
      }
    ],
    "2": [
      {
        id: "201",
        conversationId: "2",
        sender: "Marketing Team",
        text: "We need to finalize the summer drink specials soon.",
        timestamp: new Date(2023, 6, 10, 13, 0)
      },
      {
        id: "202",
        conversationId: "2",
        sender: "You",
        text: "I have some refreshing options to suggest.",
        timestamp: new Date(2023, 6, 10, 14, 30)
      },
      {
        id: "203",
        conversationId: "2",
        sender: "Marketing Team",
        text: "Could we add more tropical options?",
        timestamp: new Date(2023, 6, 10, 15, 45)
      }
    ]
  });

  const [selectedConversation, setSelectedConversation] = useState<string>("1");

  // Filter conversations by currently selected campaign
  const filteredConversations = conversations.filter(conv => conv.campaignId === selectedCampaign);

  // Handle campaign change: update selectedCampaign and reset selectedConversation if needed
  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCampaign = e.target.value;
    setSelectedCampaign(newCampaign);
    const convs = conversations.filter(c => c.campaignId === newCampaign);
    setSelectedConversation(convs.length > 0 ? convs[0].id : "");
  };

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id);
    setConversations(prev =>
      prev.map(conv => conv.id === id ? { ...conv, unread: false } : conv)
    );
  };

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentMessages = messages[selectedConversation] || [];

  return (
    <DashboardLayout
      title="Promotions"
      subtitle="Manage your promotional conversations"
    >
      <div className="mb-4 flex items-center space-x-2">
          <select value={selectedCampaign} onChange={handleCampaignChange} className="p-2 border border-gray-300 rounded">
          {campaigns.map(campaign => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
        <button onClick={handleNewCampaign} className="p-2 border border-blue-500 rounded text-blue-500 hover:bg-blue-50">
          Start new Campaign
        </button>
      </div>
      <div className="flex h-[calc(100vh-180px)] bg-white rounded-lg shadow overflow-hidden">
        {/* Left Sidebar: Conversations List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${selectedConversation === conv.id ? 'bg-blue-50' : ''}`}
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
                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                <p className="text-xs text-gray-500 mt-1">{conv.participants.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Messages */}
        <div className="w-2/3 flex flex-col">
          {currentConversation ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">{currentConversation.title}</h2>
                <p className="text-sm text-gray-500">{currentConversation.participants.join(", ")}</p>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {currentMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`p-3 rounded-lg max-w-xs ${msg.sender === "You" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>
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
              <p className="text-gray-500">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
