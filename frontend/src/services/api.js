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
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const normalizeLoginPayload = (credentialsOrEmail, password) => (
  typeof credentialsOrEmail === 'object'
    ? credentialsOrEmail
    : { email: credentialsOrEmail, password }
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
  register: (data) => api.post('/auth/register', data),
  login: (credentialsOrEmail, password) => api.post('/auth/login', normalizeLoginPayload(credentialsOrEmail, password)),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  getUser: () => api.get('/user'),
};

// File Upload API
export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
    return api.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadImages: (files) => {
    return Promise.all(files.map((file) => uploadApi.uploadImage(file)));
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
  getEvents: (params) => api.get('/admin/events', { params }),
  createEvent: (data) => api.post('/admin/events', data),
  updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),
  publishEvent: (id) => api.post(`/admin/events/${id}/publish`),
  unpublishEvent: (id) => api.post(`/admin/events/${id}/unpublish`),
  
  // Bookings
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getBooking: (id) => api.get(`/admin/bookings/${id}`),
  updateBooking: (id, data) => api.put(`/admin/bookings/${id}`, data),
  exportBookings: (params) => api.post('/admin/bookings/export', params),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Users
  getUsers: () => api.get('/admin/users'),
  toggleAdmin: (id) => api.put(`/admin/users/${id}/toggle-admin`),
};

export default api;

