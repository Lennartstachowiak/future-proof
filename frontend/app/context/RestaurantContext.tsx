"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { apiGet } from "../utils/api";

// Define the API response type
type RestaurantListResponse = {
  restaurants: Restaurant[];
};

// Define the Restaurant type
type Restaurant = {
  id: string;
  name: string;
};

// Define the context type
type RestaurantContextType = {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant) => void;
  isLoading: boolean;
  error: string | null;
};

// Create the context with a default value
const RestaurantContext = createContext<RestaurantContextType>({
  restaurants: [],
  selectedRestaurant: null,
  setSelectedRestaurant: () => {},
  isLoading: false,
  error: null,
});

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        // Use our custom API fetch utility instead of the native fetch
        const data = await apiGet<RestaurantListResponse>("api/v1/restaurant/");
        setRestaurants(data.restaurants);

        if (data.restaurants.length > 0 && !selectedRestaurant) {
          setSelectedRestaurant(data.restaurants[0]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [selectedRestaurant]);

  const contextValue = {
    restaurants,
    selectedRestaurant,
    setSelectedRestaurant,
    isLoading,
    error,
  };

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => useContext(RestaurantContext);
