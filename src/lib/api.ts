import axios from 'axios';

// ============================================
// API URL CONFIG - FIXED!
// ============================================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://nyumba-salama-api.onrender.com/api'
    : 'https://nyumba-salama-api.onrender.com/api');

// ============================================
// RESOLVE VIDEO URL - FIXED!
// ============================================
export const resolveVideoUrl = (url: string): string => {
  if (!url) return '';

  // If it's a localhost URL, convert to relative path
  if (url.includes('localhost:8000')) {
    const parts = url.split('/uploads/');
    if (parts.length > 1) {
      return `/uploads/${parts[1]}`;
    }
    return url;
  }

  // If it already has http/https, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Otherwise, prepend API base URL
  return `${API_BASE_URL}${url}`;
};

// ============================================
// AXIOS CLIENT
// ============================================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
