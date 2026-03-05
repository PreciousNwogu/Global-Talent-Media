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

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
};

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
  getBankDetails: (bookingId) => api.post('/payments/bank-details', { booking_id: bookingId }),
};

// Admin CMS API
export const adminApi = {
  // Dashboard
  getStats:      ()         => api.get('/admin/dashboard/stats'),
  getRevenue:    ()         => api.get('/admin/dashboard/revenue'),

  // Events
  getEvents:     (params)   => api.get('/admin/events', { params }),
  createEvent:   (data)     => api.post('/admin/events', data),
  updateEvent:   (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent:   (id)       => api.delete(`/admin/events/${id}`),
  publishEvent:  (id)       => api.post(`/admin/events/${id}/publish`),
  unpublishEvent:(id)       => api.post(`/admin/events/${id}/unpublish`),

  // Bookings
  getBookings:   (params)   => api.get('/admin/bookings', { params }),
  updateBooking: (id, data) => api.put(`/admin/bookings/${id}`, data),

  // Categories
  getCategories:   ()         => api.get('/admin/categories'),
  createCategory:  (data)     => api.post('/admin/categories', data),
  updateCategory:  (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory:  (id)       => api.delete(`/admin/categories/${id}`),

  // Users
  getUsers:     ()   => api.get('/admin/users'),
  toggleAdmin:  (id) => api.put(`/admin/users/${id}/toggle-admin`),
};

export default api;

