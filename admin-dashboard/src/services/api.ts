import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const token = state.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to parse auth storage');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  toggleUserBlock: (userId: string, isBlocked: boolean) =>
    api.put(`/admin/users/${userId}/block`, { isBlocked }),
  getDrivers: (params?: any) => api.get('/admin/drivers', { params }),
  approveDriver: (driverId: string, isApproved: boolean, reason?: string) =>
    api.put(`/admin/drivers/${driverId}/approval`, { isApproved, rejectionReason: reason }),
  getAllRides: (params?: any) => api.get('/admin/rides', { params }),
  updatePricing: (data: any) => api.put('/admin/pricing', data),
  updateCommission: (rate: number) => api.put('/admin/commission', { rate }),
  createPromoCode: (data: any) => api.post('/admin/promo-codes', data),
  getPromoCodes: () => api.get('/admin/promo-codes'),
  togglePromoCode: (id: string, isActive: boolean) =>
    api.put(`/admin/promo-codes/${id}/toggle`, { isActive }),
  getSOSAlerts: (status?: string) => api.get(`/admin/sos-alerts?status=${status}`),
  resolveSOSAlert: (id: string, notes?: string) =>
    api.put(`/admin/sos-alerts/${id}/resolve`, { notes }),
  getEarningsReport: (params?: any) => api.get('/admin/earnings/report', { params }),
  createRider: (data: any) => api.post('/admin/users/rider', data),
  createRide: (data: any) => api.post('/admin/rides', data),
};

export default api;