import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://nyumba-salama-api.onrender.com/api'
    : 'https://nyumba-salama-api.onrender.com/api');

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
  return `${API_BASE_URL}${url}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: unknown) =>
    api.post('/auth/register', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
  logout: () =>
    api.post('/auth/logout'),
};

// ============================================
// USER API
// ============================================
export const userApi = {
  getProfile: () =>
    api.get('/users/profile'),
  updateProfile: (data: unknown) =>
    api.put('/users/profile', data),
  getById: (id: string) =>
    api.get(`/users/${id}`),
  getDashboard: () =>
    api.get('/users/dashboard'),
  getStats: () =>
    api.get('/users/stats'),
};

// ============================================
// PROPERTIES API
// ============================================
export const propertyApi = {
  getAll: (params?: unknown) =>
    api.get('/properties', { params }),
  getById: (id: string) =>
    api.get(`/properties/${id}`),
  create: (data: unknown) =>
    api.post('/properties', data),
  update: (id: string, data: unknown) =>
    api.put(`/properties/${id}`, data),
  delete: (id: string) =>
    api.delete(`/properties/${id}`),
  getByUniversity: (university: string) =>
    api.get(`/properties/university/${university}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/properties/${id}/status`, { status }),
};

// ============================================
// VIDEOS API
// ============================================
export const videoApi = {
  getAll: (params?: unknown) =>
    api.get('/videos', { params }),
  getById: (id: string) =>
    api.get(`/videos/${id}`),
  getMyVideos: () =>
    api.get('/videos/my'),
  getUserVideos: () =>
    api.get('/videos/user'),
  upload: (formData: FormData) =>
    api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  verify: (id: string, data: { status: string }) =>
    api.post(`/videos/${id}/verify`, data),
  like: (id: string) =>
    api.post(`/videos/${id}/like`),
  delete: (id: string) =>
    api.delete(`/videos/${id}`),
};

// ============================================
// FAVORITES API
// ============================================
export const favoritesApi = {
  getAll: () =>
    api.get('/favorites'),
  add: (propertyId: string) =>
    api.post('/favorites', { propertyId }),
  remove: (propertyId: string) =>
    api.delete(`/favorites/${propertyId}`),
  check: (propertyId: string) =>
    api.get(`/favorites/check/${propertyId}`),
};

// ============================================
// REVIEWS API
// ============================================
export const reviewApi = {
  getByProperty: (propertyId: string) =>
    api.get(`/reviews/property/${propertyId}`),
  create: (data: { propertyId: string; rating: number; comment: string }) =>
    api.post('/reviews', data),
  update: (id: string, data: unknown) =>
    api.put(`/reviews/${id}`, data),
  delete: (id: string) =>
    api.delete(`/reviews/${id}`),
};

// ============================================
// CHATBOT API
// ============================================
export const chatbotApi = {
  ask: (message: string) =>
    api.post('/api/chatbot/ask', { query: message }),
};

// ============================================
// ADMIN API - COMPLETE
// ============================================
export const adminApi = {
  getStats: () =>
    api.get('/admin/stats'),
  getUsers: (params?: unknown) =>
    api.get('/admin/users', { params }),
  getProperties: (params?: unknown) =>
    api.get('/admin/properties', { params }),
  getVideos: (params?: unknown) =>
    api.get('/admin/videos', { params }),
  updateUser: (id: string, data: unknown) =>
    api.put(`/admin/users/${id}`, data),
  updateUserStatus: (id: string, status: string) =>
    api.put(`/admin/users/${id}/status`, { status }),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  updateProperty: (id: string, data: unknown) =>
    api.put(`/admin/properties/${id}`, data),
  updatePropertyStatus: (id: string, status: string) =>
    api.put(`/admin/properties/${id}/status`, { status }),
  updateVideo: (id: string, data: unknown) =>
    api.put(`/admin/videos/${id}`, data),
  updateVideoStatus: (id: string, status: string) =>
    api.put(`/admin/videos/${id}/status`, { status }),
  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),
  deleteProperty: (id: string) =>
    api.delete(`/admin/properties/${id}`),
  deleteVideo: (id: string) =>
    api.delete(`/admin/videos/${id}`),
};

export default api;
