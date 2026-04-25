import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// UPDATE THIS TO YOUR COMPUTER'S IP ADDRESS
const API_URL = 'http://192.168.1.8:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const authStorage = await AsyncStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.token || parsed.token;
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
      AsyncStorage.removeItem('auth-storage');
    }
    return Promise.reject(error);
  }
);

export const riderAPI = {
  // Ride operations
  getFareEstimate: (pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType) =>
    api.get('/rider/estimate-fare', {
      params: { pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType },
    }),

  bookRide: (data) => api.post('/rider/book-ride', data),

  getRideHistory: (params) => api.get('/rider/rides', { params }),

  getRideDetails: (rideId) => api.get(`/rider/rides/${rideId}`),

  cancelRide: (rideId, reason) => api.post(`/rider/cancel-ride/${rideId}`, { reason }),

  rateRide: (rideId, rating, review, categories) =>
    api.post(`/rider/rate-ride/${rideId}`, { rating, review, categories }),

  // For testing admin create ride (bypasses real booking)
  createRide: (data) => api.post('/admin/rides', data),
};

export default api;
