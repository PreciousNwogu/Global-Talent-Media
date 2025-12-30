import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Redirect to login if not already there
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Events API
export const eventsApi = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  checkAvailability: (id) => api.get(`/events/${id}/availability`),
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

// Bookings API
export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  getByReference: (reference) => api.get(`/bookings/reference/${reference}`),
  getUserBookings: () => api.get('/user/bookings'),
  getById: (id) => api.get(`/user/bookings/${id}`),
  cancel: (id) => api.post(`/user/bookings/${id}/cancel`),
};

// Payments API
export const paymentsApi = {
  getBankDetails: (bookingReference) => api.post('/payments/bank-details', { booking_reference: bookingReference }),
};

// Auth API
export const authApi = {
  login: (email, password) => api.post('/login', { email, password }),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};

// File Upload API
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images[]', file);
    });
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Admin API
export const adminApi = {
  // Dashboard
  getStats: () => api.get('/admin/dashboard/stats'),
  getRevenue: () => api.get('/admin/dashboard/revenue'),
  
  // Events
  getAllEvents: (params) => api.get('/admin/events', { params }),
  getEvent: (id) => api.get(`/admin/events/${id}`),
  createEvent: (data) => api.post('/admin/events', data),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  publishEvent: (id) => api.post(`/admin/events/${id}/publish`),
  unpublishEvent: (id) => api.post(`/admin/events/${id}/unpublish`),
  
  // Bookings
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getBooking: (id) => api.get(`/admin/bookings/${id}`),
  updateBooking: (id, data) => api.put(`/admin/bookings/${id}`, data),
  exportBookings: (params) => api.post('/admin/bookings/export', params),
};

export default api;

