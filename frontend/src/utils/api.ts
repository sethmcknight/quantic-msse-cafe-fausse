/**
 * API client for Café Fausse backend services
 * 
 * This module provides structured API client utilities for communicating with 
 * the Café Fausse backend services. It includes specialized clients for
 * menu data, reservations, and newsletter subscriptions.
 * 
 * The implementation handles common concerns like:
 * - Error handling and logging
 * - CORS configuration
 * - JSON serialization/deserialization
 * - Endpoint formatting
 */

// Use environment variable for API base URL or default to localhost matching backend port
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Ensures endpoints are properly formatted without duplicate slashes
 * 
 * @param endpoint - The API endpoint path
 * @returns Properly formatted endpoint path with leading slash
 */
const formatEndpoint = (endpoint: string) => {
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

/**
 * Handles and standardizes API error responses
 * 
 * @param error - The error caught from the fetch operation
 * @param endpoint - The endpoint that was being accessed
 * @returns A standardized error with helpful message
 */
const handleApiError = (error: any, endpoint: string) => {
  console.error(`API Error calling ${endpoint}:`, error);
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return new Error('Cannot connect to server. Please ensure the backend is running and accessible.');
  }
  return error;
};

/**
 * Base API client with common request handling
 * 
 * Provides generic methods for making HTTP requests to the API server
 * with standardized error handling and logging.
 */
const apiClient = {
  /**
   * Send a GET request to the API
   * 
   * @param endpoint - The API endpoint path
   * @returns Promise resolving to the response data of type T
   * @throws Error if the request fails
   */
  async get<T>(endpoint: string): Promise<T> {
    try {
      const url = `${API_BASE_URL}${formatEndpoint(endpoint)}`;
      console.log(`Making GET request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitly request CORS
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API responded with status ${response.status}: ${errorText}`);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      throw handleApiError(error, endpoint);
    }
  },
  
  /**
   * Send a POST request to the API
   * 
   * @param endpoint - The API endpoint path
   * @param data - The payload to send in the request body
   * @returns Promise resolving to the response data of type T
   * @throws Error if the request fails
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const url = `${API_BASE_URL}${formatEndpoint(endpoint)}`;
      console.log(`Making POST request to: ${url}`, data);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'cors', // Explicitly request CORS
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`API responded with status ${response.status}:`, errorData);
        throw new Error(errorData?.message || `API error: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      throw handleApiError(error, endpoint);
    }
  },
};

/**
 * Menu API client
 * 
 * Provides methods for retrieving menu data from the backend,
 * including categories and menu items.
 */
export const menuApi = {
  /**
   * Get all menu categories
   * 
   * @returns Promise with array of menu categories
   */
  async getCategories() {
    return apiClient.get<{
      success: boolean;
      categories: Array<{
        id: number;
        name: string;
        description: string;
      }>;
    }>('/menu/categories');
  },
  
  /**
   * Get menu items, optionally filtered by category
   * 
   * @param categoryId - Optional ID to filter items by category
   * @returns Promise with array of menu items
   */
  async getItems(categoryId?: number) {
    const endpoint = categoryId 
      ? `/menu/categories/${categoryId}/items` 
      : '/menu/items';
    
    return apiClient.get<{
      success: boolean;
      items: Array<{
        id: number;
        name: string;
        description: string;
        price: number;
        category_id: number;
        is_vegetarian: boolean;
        is_vegan: boolean;
        is_gluten_free: boolean;
        image_url: string | null;
      }>;
    }>(endpoint);
  },
};

/**
 * Reservation API client
 * 
 * Provides methods for checking availability and creating
 * restaurant reservations.
 */
export const reservationApi = {
  /**
   * Check availability for a specific date, time, and party size
   * 
   * @param date - The date for the reservation (YYYY-MM-DD)
   * @param time - The time for the reservation (HH:MM)
   * @param guests - The number of guests
   * @returns Promise with availability information
   */
  async checkAvailability(date: string, time: string, guests: number) {
    return apiClient.post<{
      available: boolean;
      tables_remaining: number;
      message?: string;
    }>('/reservations/check-availability', {
      date,
      time,
      guests,
    });
  },
  
  /**
   * Create a new reservation
   * 
   * @param formData - The reservation form data
   * @returns Promise with reservation creation result
   */
  async createReservation(formData: {
    name: string;
    email: string;
    phone?: string;
    date: string;
    time: string;
    guests: number | string;
    specialRequests?: string;
    newsletterOptIn: boolean;
  }) {
    return apiClient.post<{
      success: boolean;
      message: string;
      reservation_id?: number;
      table_number?: number;
    }>('/reservations', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date: formData.date,
      time: formData.time,
      guests: Number(formData.guests),
      special_requests: formData.specialRequests,
      newsletter_opt_in: formData.newsletterOptIn,
    });
  },
};

/**
 * Newsletter API client
 * 
 * Provides methods for managing newsletter subscriptions.
 */
export const newsletterApi = {
  /**
   * Subscribe to newsletter
   * 
   * @param email - The email address to subscribe
   * @returns Promise with subscription result
   */
  async subscribe(email: string) {
    return apiClient.post<{
      success: boolean;
      message: string;
    }>('/newsletter/subscribe', {
      email,
    });
  },
  
  /**
   * Unsubscribe from newsletter
   * 
   * @param email - The email address to unsubscribe
   * @returns Promise with unsubscription result
   */
  async unsubscribe(email: string) {
    return apiClient.post<{
      success: boolean;
      message: string;
    }>('/newsletter/unsubscribe', {
      email,
    });
  },
};

/**
 * Combined API client object that provides access to all API services
 */
const apiServices = {
  menu: menuApi,
  reservation: reservationApi,
  newsletter: newsletterApi,
};

export default apiServices;