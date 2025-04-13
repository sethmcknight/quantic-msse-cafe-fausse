/**
 * AppContext Module
 * 
 * This module provides a global context for the Café Fausse application,
 * managing shared state like menu items, categories, loading states, and notifications.
 * It serves as a centralized state management solution using React Context API.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { menuApi } from '../utils/api';

/**
 * MenuItem Type
 * 
 * Represents a menu item from the restaurant's menu
 */
type MenuItem = {
  /** Unique identifier for the menu item */
  id: number;
  /** Name of the menu item */
  name: string;
  /** Description of the menu item */
  description: string;
  /** Price of the menu item */
  price: number;
  /** ID of the category this item belongs to */
  category_id: number;
  /** Whether the item is vegetarian */
  is_vegetarian: boolean;
  /** Whether the item is vegan */
  is_vegan: boolean;
  /** Whether the item is gluten-free */
  is_gluten_free: boolean;
  /** Optional URL to an image of the menu item */
  image_url: string | null;
};

/**
 * Category Type
 * 
 * Represents a menu category
 */
type Category = {
  /** Unique identifier for the category */
  id: number;
  /** Name of the category */
  name: string;
  /** Description of the category */
  description: string;
};

/**
 * NotificationType
 * 
 * Types of notifications that can be shown to the user
 */
type NotificationType = 'success' | 'error' | 'info';

/**
 * AppContextType
 * 
 * Defines the shape of the application context
 */
type AppContextType = {
  /** List of menu items fetched from the API */
  menuItems: MenuItem[];
  /** List of categories fetched from the API */
  categories: Category[];
  /** Loading state indicator */
  isLoading: boolean;
  /** Error message if API request fails */
  error: string | null;
  /** Function to show a notification message */
  showNotification: (message: string, type: NotificationType) => void;
  /** Function to refresh menu data from the API */
  refreshMenuData: () => Promise<void>;
};

// Create context with default values
const AppContext = createContext<AppContextType>({
  menuItems: [],
  categories: [],
  isLoading: false,
  error: null,
  showNotification: () => {},
  refreshMenuData: async () => {},
});

/**
 * Custom hook to use the AppContext
 * 
 * @returns The current context value for AppContext
 */
export const useAppContext = () => useContext(AppContext);

/**
 * AppProvider Component
 * 
 * Provides the AppContext to the component tree.
 * Manages the state for menu items, categories, loading state, and errors.
 * Fetches menu data on initial render.
 * 
 * @param children - Child components that will have access to the context
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Shows a notification message to the user
   * 
   * @param message - The message to display
   * @param type - The type of notification: success, error, or info
   */
  const showNotification = (message: string, type: NotificationType = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // In a real application, this would display a visual notification
  };

  /**
   * Fetches menu data from the API
   * Gets both categories and menu items
   */
  const fetchMenuData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch categories
      const categoriesResponse = await menuApi.getCategories();
      setCategories(categoriesResponse.categories);
      
      // Fetch all menu items
      const itemsResponse = await menuApi.getItems();
      setMenuItems(itemsResponse.items);
    } catch (err: any) {
      console.error('Error fetching menu data:', err);
      
      // More user-friendly error message based on the error type
      let errorMessage = 'Failed to fetch menu data. Please check your connection.';
      
      if (err.message && err.message.includes('Cannot connect to server')) {
        errorMessage = 'Cannot connect to the restaurant server. Please make sure the backend service is running.';
      } else if (err.message && err.message.includes('API error: 404')) {
        errorMessage = 'The requested menu information could not be found.';
      } else if (err.message && err.message.includes('API error: 500')) {
        errorMessage = 'The restaurant server encountered an error. Please try again later.';
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]); // Add showNotification as a dependency

  /**
   * Refreshes menu data from the API
   * Can be called from components to update menu information
   */
  const refreshMenuData = async () => {
    await fetchMenuData();
  };

  // Load menu data on component mount
  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]); // Add fetchMenuData as a dependency

  // Context value
  const contextValue: AppContextType = {
    menuItems,
    categories,
    isLoading,
    error,
    showNotification,
    refreshMenuData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContext;