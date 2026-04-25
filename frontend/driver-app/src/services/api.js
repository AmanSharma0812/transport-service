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

export const driverAPI = {
  // Dashboard
  getDashboard: () => api.get('/driver/dashboard'),

  // Toggle online/offline
  toggleStatus: (isOnline) => api.put('/driver/toggle-status', { isOnline }),

  // Ride requests
  getRideRequests: (params) => api.get('/driver/ride-requests', { params }),

  // Ride actions
  acceptRide: (rideId) => api.post(`/driver/accept-ride/${rideId}`),
  declineRide: (rideId, reason) => api.post(`/driver/decline-ride/${rideId}`, { reason }),
  markArriving: (rideId) => api.put(`/driver/arriving/${rideId}`),
  startRide: (rideId) => api.put(`/driver/start-ride/${rideId}`),
  completeRide: (rideId) => api.put(`/driver/complete-ride/${rideId}`),

  // Ride history
  getRides: (params) => api.get('/driver/rides', { params }),

  // Earnings
  getEarnings: (params) => api.get('/driver/earnings', { params }),

  // Profile
  updateProfile: (data) => api.put('/driver/profile', data),
  updateLocation: (location) => api.put('/driver/location', { location }),
};

export default api;
