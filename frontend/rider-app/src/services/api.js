import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // In React Native, we'll try to get token from storage or a simple global
    // For simplicity, we'll rely on the existing auth storage pattern
    try {
      const authStorage = require('@react-native-async-storage/async-storage')
        .getItem('auth-storage');
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        const token = state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('Failed to get auth token:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear storage and navigate to login
      require('@react-native-async-storage/async-storage').removeItem('auth-storage');
      // Navigation handled by component state
    }
    return Promise.reject(error);
  }
);

export const riderAPI = {
  // Ride operations
  getFareEstimate: (pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType) =>
    api.get('/rider/fare', {
      params: { pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType },
    }),

  bookRide: (data) => api.post('/rider/book', data),

  getRideHistory: (params) => api.get('/rider/rides', { params }),

  getRideDetails: (rideId) => api.get(`/rider/rides/${rideId}`),

  cancelRide: (rideId, reason) => api.put(`/rider/rides/${rideId}/cancel`, { reason }),

  rateRide: (rideId, rating, review, categories) =>
    api.post(`/rider/rides/${rideId}/rate`, { rating, review, categories }),

  // For testing admin create ride (bypasses real booking)
  createRide: (data) => api.post('/admin/rides', data),
};

export default api;
