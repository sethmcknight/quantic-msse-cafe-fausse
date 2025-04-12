import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { menuApi } from '../utils/api';

// Define types
type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  image_url: string | null;
};

type Category = {
  id: number;
  name: string;
  description: string;
};

export type NotificationType = 'success' | 'error' | 'info';

// Define the context type with a cleaner notification interface
type AppContextType = {
  menuItems: MenuItem[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  showNotification: (message: string, type: NotificationType) => void;
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

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch menu data
  const fetchMenuData = async () => {
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
      setError(err.message || 'Failed to fetch menu data');
      showNotification('Failed to load menu data. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple notification function for consistent application notifications
  const showNotification = (message: string, type: NotificationType = 'info') => {
    // We'll implement a custom event that other components can listen for
    const event = new CustomEvent('cafe-fausse-notification', { 
      detail: { message, type }
    });
    document.dispatchEvent(event);
  };

  // Load menu data on component mount
  useEffect(() => {
    fetchMenuData();
  }, []);

  // Context value
  const contextValue: AppContextType = {
    menuItems,
    categories,
    isLoading,
    error,
    showNotification,
    refreshMenuData: fetchMenuData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContext;