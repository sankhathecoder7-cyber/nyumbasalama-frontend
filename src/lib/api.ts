import axios from 'axios';

// ============================================
// API URL CONFIG
// ============================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://nyumbasalama-backend.onrender.com/api'
    : 'http://localhost:8000/api');



// ============================================
// RESOLVE VIDEO URL - FIXED!
// ============================================
export const resolveVideoUrl = (url: string): string => {
  if (!url) return '';
  
  if (url.includes('localhost:8000')) {
    const parts = url.split('/uploads/');
    if (parts.length > 1) {
      return `/uploads/${parts[1]}`;
    }
    return url;
  }
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('/')) return url;
  
  return `/uploads/${url}`;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; phone: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

export const propertyApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/properties', { params }),
  getById: (id: string) =>
    api.get(`/properties/${id}`),
  getByUniversity: (university: string) =>
    api.get(`/properties/university/${university}`),
  create: (data: Record<string, any>) =>
    api.post('/properties', data),
  update: (id: string, data: Record<string, any>) =>
    api.put(`/properties/${id}`, data),
  delete: (id: string) =>
    api.delete(`/properties/${id}`),
};

export const videoApi = {
  getAll: (params?: Record<string, any>) =>
    api.get('/videos', { params }),
  getUserVideos: () =>
    api.get('/videos/my'),
  getById: (id: string) =>
    api.get(`/videos/${id}`),
  upload: (formData: FormData) =>
    api.post('/videos/upload', formData),
  like: (id: string) =>
    api.post(`/videos/${id}/like`),
  verify: (id: string, status: string) =>
    api.post(`/videos/${id}/verify`, { status }),
  delete: (id: string) =>
    api.delete(`/videos/${id}`),
};

export const userApi = {
  getProfile: () =>
    api.get('/users/profile'),
  getDashboard: () =>
    api.get('/users/dashboard'),
  updateProfile: (data: Record<string, string>) =>
    api.put('/users/profile', data),
};

export const favoritesApi = {
  getAll: () =>
    api.get('/favorites'),
  check: (propertyId: string) =>
    api.get(`/favorites/check/${propertyId}`),
  add: (propertyId: string) =>
    api.post(`/favorites/${propertyId}`),
  remove: (propertyId: string) =>
    api.delete(`/favorites/${propertyId}`),
};

export const reviewApi = {
  getByProperty: (propertyId: string) =>
    api.get(`/reviews/property/${propertyId}`),
  create: (data: { propertyId: string; rating: number; comment: string }) =>
    api.post('/reviews', data),
  update: (id: string, rating: number, comment: string) =>
    api.put(`/reviews/${id}`, { rating, comment }),
  delete: (id: string) =>
    api.delete(`/reviews/${id}`),
};

export const chatbotApi = {
  ask: (question: string) =>
    api.post('/chatbot/ask', { question }),
  recommend: (query: Record<string, any>) =>
    api.post('/chatbot/recommend', query),
  compare: (ids: string[]) =>
    api.post('/chatbot/compare', { ids }),
  getHistory: () =>
    api.get('/chatbot/history'),
  clearHistory: () =>
    api.delete('/chatbot/history'),
};

export const adminApi = {
  getStats: () =>
    api.get('/admin/stats'),
  getVideos: () =>
    api.get('/admin/videos'),
  verifyVideo: (id: string) =>
    api.put(`/admin/videos/${id}/verify`),
  deleteVideo: (id: string) =>
    api.delete(`/admin/videos/${id}`),
  getProperties: () =>
    api.get('/admin/properties'),
  updatePropertyStatus: (id: string, status: string) =>
    api.put(`/admin/properties/${id}/status`, { status }),
  deleteProperty: (id: string) =>
    api.delete(`/admin/properties/${id}`),
  getUsers: () =>
    api.get('/admin/users'),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),
};

export default api;