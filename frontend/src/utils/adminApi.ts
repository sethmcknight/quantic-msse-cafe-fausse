import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Configure axios to include credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Authentication APIs
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  }
};

// Employee APIs
export const employeeApi = {
  getAll: async () => {
    const response = await api.get('/admin/employees');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/admin/employees/${id}`);
    return response.data;
  },

  create: async (employeeData: any) => {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  },

  update: async (id: number, employeeData: any) => {
    const response = await api.put(`/admin/employees/${id}`, employeeData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/employees/${id}`);
    return response.data;
  }
};

// Menu Item APIs
export const adminMenuApi = {
  getAll: async () => {
    const response = await api.get('/admin/menu-items');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/admin/menu-items/${id}`);
    return response.data;
  },

  create: async (itemData: any) => {
    const response = await api.post('/admin/menu-items', itemData);
    return response.data;
  },

  update: async (id: number, itemData: any) => {
    const response = await api.put(`/admin/menu-items/${id}`, itemData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/menu-items/${id}`);
    return response.data;
  }
};

// Category APIs
export const adminCategoryApi = {
  getAll: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/admin/categories/${id}`);
    return response.data;
  },

  create: async (categoryData: any) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },

  update: async (id: number, categoryData: any) => {
    const response = await api.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  }
};

// Reservation APIs
export const adminReservationApi = {
  getAll: async () => {
    const response = await api.get('/admin/reservations');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/admin/reservations/${id}`);
    return response.data;
  },

  update: async (id: number, reservationData: any) => {
    const response = await api.put(`/admin/reservations/${id}`, reservationData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/admin/reservations/${id}`);
    return response.data;
  }
};

// Customer APIs
export const adminCustomerApi = {
  getAll: async () => {
    const response = await api.get('/admin/customers');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  }
};

// Newsletter API
export const adminNewsletterApi = {
  getSubscribers: async () => {
    const response = await api.get('/admin/newsletter-subscribers');
    return response.data;
  }
};

// Dashboard API
export const adminDashboardApi = {
  getData: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  }
};

export default {
  auth: authApi,
  employees: employeeApi,
  menuItems: adminMenuApi,
  categories: adminCategoryApi,
  reservations: adminReservationApi,
  customers: adminCustomerApi,
  newsletter: adminNewsletterApi,
  dashboard: adminDashboardApi
};