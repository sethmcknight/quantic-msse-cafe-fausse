/**
 * API client for Café Fausse backend services
 */

// Use environment variable for API base URL or default to localhost in development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Ensure endpoints are properly formatted without duplicate slashes
const formatEndpoint = (endpoint: string) => {
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

/**
 * Base API client with common request handling
 */
const apiClient = {
  /**
   * Send a GET request to the API
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${formatEndpoint(endpoint)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Send a POST request to the API
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${formatEndpoint(endpoint)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
};

/**
 * Menu API client
 */
export const menuApi = {
  /**
   * Get all menu categories
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
   * Get all menu items
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
 */
export const reservationApi = {
  /**
   * Check availability for a specific date, time, and party size
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
   */
  async createReservation(formData: {
    name: string;
    email: string;
    phone?: string;
    date: string;
    time: string;
    guests: number | string;
    specialRequests?: string;
    newsletterOptIn: boolean; // Added newsletterOptIn field
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
      newsletter_opt_in: formData.newsletterOptIn, // Include newsletterOptIn in the payload
    });
  },
};

/**
 * Newsletter API client
 */
export const newsletterApi = {
  /**
   * Subscribe to newsletter
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

export default {
  menu: menuApi,
  reservation: reservationApi,
  newsletter: newsletterApi,
};