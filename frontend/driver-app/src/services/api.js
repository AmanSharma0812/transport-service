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
  (config) => {
    // For React Native, use AsyncStorage or similar
    // Simplified for demo - in production use @react-native-async-storage/async-storage
    const token = require('@react-native-async-storage/async-storage').getItem('auth-token')
      ?.then((token) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Navigate to login
      // navigationRef.current?.navigate('Login');
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
