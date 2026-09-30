import axios from 'axios';

// Base API URL: points to local API or relative /api
const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ca_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('ca_token');
        localStorage.removeItem('ca_user');
      }
    }
    return Promise.reject(error);
  }
);

// Format currency as Indian Rupees (INR)
export function formatINR(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

// API Service Calls
export const authService = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  demoSeed: () => api.post('/api/auth/demo-seed'),
};

export const financialService = {
  getProfile: () => api.get('/api/financial/profile'),
  createProfile: (data: any) => api.post('/api/financial/profile', data),
  updateProfile: (data: any) => api.put('/api/financial/profile', data),
};

export const creditService = {
  getScoreHistory: () => api.get('/api/credit/score-history'),
  addScore: (data: { credit_score: number; note?: string }) => api.post('/api/credit/score', data),
  getAnalytics: () => api.get('/api/credit/analytics'),
};

export const dashboardService = {
  getDashboard: () => api.get('/api/dashboard'),
};

export const aiService = {
  analyzeCredit: () => api.post('/api/ai/analyze'),
  getRecommendations: () => api.get('/api/ai/recommendations'),
};

export const reportService = {
  generateReport: (data?: { report_name?: string }) => api.post('/api/reports/generate', data || {}),
  getReports: () => api.get('/api/reports'),
  getReportDetail: (id: number) => api.get(`/api/reports/${id}`),
  getPdfUrl: (id: number) => `${API_URL}/api/reports/${id}/pdf`,
};

export const userService = {
  changePassword: (data: any) => api.post('/api/users/change-password', data),
  deleteAccount: () => api.delete('/api/users/account'),
};
