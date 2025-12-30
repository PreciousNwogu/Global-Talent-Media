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

export default api;

