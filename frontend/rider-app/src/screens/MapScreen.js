import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { riderAPI } from '../services/api';
import { io } from 'socket.io-client';

const { width, height } = Dimensions.get('window');

// Generate intermediate points along path for smooth animation
const generatePath = (start, end, segments = 50) => {
  const path = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    path.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t,
      longitude: start.longitude + (end.longitude - start.longitude) * t,
    });
  }
  return path;
};

export default function MapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { pickup, dropoff, vehicleType, estimatedFare, distance } = route.params || {};

  const [status, setStatus] = useState('searching');
  const [driver, setDriver] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [rideId, setRideId] = useState(null);
  const animationRef = useRef(null);
  const socketRef = useRef(null);

  // Mock coordinates
  const pickupCoords = { latitude: 12.9716, longitude: 77.5946 };
  const dropoffCoords = { latitude: 12.9352, longitude: 77.6245 };
  const driverStartCoords = { latitude: 12.9850, longitude: 77.6050 };

  // Connect to socket for real-time updates
  useEffect(() => {
    socketRef.current = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      // Join user room
      socketRef.current.emit('join', { userId: 'rider-123', role: 'rider' });
    });

    socketRef.current.on('rideAccepted', (data) => {
      console.log('Ride accepted:', data);
      setStatus('accepted');
      setDriver({
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        vehicle: 'KA 01 AB 1234',
        rating: 4.8,
      });
      setDriverLocation(driverStartCoords);
    });

    socketRef.current.on('rideStatusUpdate', (data) => {
      console.log('Ride status update:', data);
      if (data.status === 'arriving') {
        setStatus('arriving');
      } else if (data.status === 'ongoing') {
        setStatus('ongoing');
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Generate route path when status changes
  useEffect(() => {
    if (status === 'accepted' || status === 'arriving') {
      const path = generatePath(driverStartCoords, pickupCoords, 100);
      setRoutePath(path);
      setCurrentPathIndex(0);
    } else if (status === 'ongoing') {
      const path = generatePath(pickupCoords, dropoffCoords, 100);
      setRoutePath(path);
      setCurrentPathIndex(0);
    }
  }, [status]);

  // Animate driver along path
  useEffect(() => {
    if (status === 'accepted' || status === 'arriving' || status === 'ongoing') {
      animationRef.current = setInterval(() => {
        setCurrentPathIndex((prev) => {
          if (prev >= routePath.length - 1) {
            clearInterval(animationRef.current);
            return prev;
          }
          const newIndex = prev + 1;
          setDriverLocation(routePath[newIndex]);
          return newIndex;
        });
      }, 50);

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [status, routePath]);

  // Book ride when component mounts
  useEffect(() => {
    bookRide();
  }, []);

  const bookRide = async () => {
    try {
      const response = await riderAPI.bookRide({
        pickupLat: pickupCoords.latitude,
        pickupLng: pickupCoords.longitude,
        pickupAddress: pickup,
        dropoffLat: dropoffCoords.latitude,
        dropoffLng: dropoffCoords.longitude,
        dropoffAddress: dropoff,
        vehicleType,
        paymentMethod: 'cash',
      });

      setRideId(response.data.data.rideId);
      console.log('Ride booked:', response.data.data);
      // Status remains 'searching' until driver accepts via socket
    } catch (error) {
      console.error('Failed to book ride:', error);
      Alert.alert('Error', 'Failed to book ride. Please try again.');
      navigation.goBack();
    }
  };

  // Simulate status changes for demo (remove when real backend is connected)
  useEffect(() => {
    // Demo: simulate driver accepting after 3 seconds
    if (status === 'searching') {
      const timer = setTimeout(() => {
        setStatus('accepted');
        setDriver({
          name: 'Rajesh Kumar',
          phone: '+91 9876543210',
          vehicle: 'KA 01 AB 1234',
          rating: 4.8,
        });
        setDriverLocation(driverStartCoords);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Handle button actions
  const handleDriverArriving = () => {
    // In real app, this would be triggered by driver action
    setStatus('arriving');
  };

  const handleStartRide = () => {
    setStatus('ongoing');
  };

  const handleCompleteRide = () => {
    setStatus('completed');
  };

  return (
    <View className="flex-1">
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          ...pickupCoords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {/* Pickup marker */}
        <Marker
          coordinate={pickupCoords}
          title="Pickup"
          description={pickup}
          pinColor="green"
        />

        {/* Dropoff marker */}
        <Marker
          coordinate={dropoffCoords}
          title="Dropoff"
          description={dropoff}
          pinColor="red"
        />

        {/* Route polyline - dashed line showing planned route */}
        <Polyline
          coordinates={[pickupCoords, dropoffCoords]}
          strokeColor="#3B82F6"
          strokeWidth={4}
          strokePattern={[1, 3]}
        />

        {/* Animated driver marker */}
        {driverLocation && status !== 'searching' && (
          <Marker
            coordinate={driverLocation}
            title={driver?.name}
            description={driver?.vehicle}
          >
            <View className="bg-blue-500 rounded-full p-2 border-2 border-white shadow-lg">
              <Text style={{ fontSize: 20 }}>
                {vehicleType === 'bike' ? '🏍️' : vehicleType === 'auto' ? '🛻' : '🚗'}
              </Text>
            </View>
          </Marker>
        )}

        {/* Progress circle at pickup when driver is arriving */}
        {status === 'arriving' && driverLocation && (
          <Circle
            center={pickupCoords}
            radius={20}
            strokeColor="#10B981"
            fillColor="rgba(16, 185, 129, 0.2)"
          />
        )}
      </MapView>

      {/* Status Bar */}
      <View className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-bold text-gray-900">
              {status === 'searching' ? 'Finding driver...' : 'Driver Found'}
            </Text>
            {driver && (
              <Text className="text-sm text-gray-600">
                {driver.name} • {driver.rating}★
              </Text>
            )}
          </View>

          {status === 'searching' ? (
            <ActivityIndicator size="large" color="#3B82F6" />
          ) : (
            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded-lg"
              onPress={() => navigation.navigate('Chat')}
            >
              <Text className="text-white font-medium">Call</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress steps */}
        <View className="flex-row items-center mt-4">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              ['searching', 'accepted', 'arriving', 'ongoing', 'completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          >
            <Text className="text-white text-xs">✓</Text>
          </View>
          <View
            className={`flex-1 h-1 mx-2 ${
              ['accepted', 'arriving', 'ongoing', 'completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              ['arriving', 'ongoing', 'completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          >
            <Text className="text-white text-xs">📍</Text>
          </View>
          <View
            className={`flex-1 h-1 mx-2 ${
              ['ongoing', 'completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              ['completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          >
            <Text className="text-white text-xs">🏁</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl">
        {status === 'searching' && (
          <View>
            <Text className="text-center text-lg font-bold text-gray-900 mb-2">
              Searching for nearby {vehicleType}s
            </Text>
            <Text className="text-center text-gray-500">
              Finding the best driver for you...
            </Text>
            <ActivityIndicator size="large" color="#3B82F6" className="mt-6" />
          </View>
        )}

        {status === 'accepted' && driver && (
          <View>
            <View className="flex-row items-center mb-4">
              <View className="h-16 w-16 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Text className="text-2xl">
                  {vehicleType === 'bike' ? '🏍️' : vehicleType === 'auto' ? '🛻' : '🚗'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold">{driver.name}</Text>
                <Text className="text-gray-500">
                  {vehicleType.toUpperCase()} • {driver.vehicle}
                </Text>
              </View>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 font-bold">{driver.rating}★</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="font-bold text-xl text-gray-900">
                ₹{Math.round(estimatedFare)}
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-full"
                onPress={handleDriverArriving}
              >
                <Text className="text-white font-bold">Driver Arriving</Text>
              </TouchableOpacity>
            </View>

            {/* Distance info */}
            <View className="mt-4 bg-blue-50 rounded-xl p-3">
              <Text className="text-blue-800 text-sm">
                Driver is {status === 'arriving' ? 'arriving' : 'on the way'} • {Math.round((currentPathIndex / routePath.length) * 100)}% complete to pickup
              </Text>
            </View>
          </View>
        )}

        {status === 'arriving' && (
          <View>
            <Text className="text-lg font-bold mb-4">Driver has arrived at pickup</Text>
            <View className="bg-yellow-50 rounded-xl p-3 mb-4">
              <Text className="text-yellow-800 text-sm">
                Your driver is waiting at the pickup location
              </Text>
            </View>
            <TouchableOpacity
              className="bg-green-600 py-3 rounded-xl items-center"
              onPress={handleStartRide}
            >
              <Text className="text-white font-bold">Start Ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'ongoing' && (
          <View>
            <Text className="text-lg font-bold mb-4">Ride in progress</Text>
            <View className="flex-row justify-between items-center bg-blue-50 p-4 rounded-xl">
              <View>
                <Text className="text-gray-500 text-sm">Distance</Text>
                <Text className="font-bold">{distance.toFixed(1)} km</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Fare</Text>
                <Text className="font-bold">₹{Math.round(estimatedFare)}</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Progress</Text>
                <Text className="font-bold">{Math.round((currentPathIndex / routePath.length) * 100)}%</Text>
              </View>
            </View>
            <TouchableOpacity
              className="bg-green-600 py-3 rounded-xl items-center mt-4"
              onPress={handleCompleteRide}
            >
              <Text className="text-white font-bold">Complete Ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'arriving' && (
          <View>
            <Text className="text-lg font-bold mb-4">Driver is arriving</Text>
            <View className="bg-yellow-50 rounded-xl p-3 mb-4">
              <Text className="text-yellow-800 text-sm">
                Driver has arrived at pickup location
              </Text>
            </View>
            <TouchableOpacity
              className="bg-green-600 py-3 rounded-xl items-center"
              onPress={() => setStatus('ongoing')}
            >
              <Text className="text-white font-bold">Start Ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'ongoing' && (
          <View>
            <Text className="text-lg font-bold mb-4">Ride in progress</Text>
            <View className="flex-row justify-between items-center bg-blue-50 p-4 rounded-xl">
              <View>
                <Text className="text-gray-500 text-sm">Distance</Text>
                <Text className="font-bold">{distance.toFixed(1)} km</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Fare</Text>
                <Text className="font-bold">₹{Math.round(estimatedFare)}</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Progress</Text>
                <Text className="font-bold">{Math.round((currentPathIndex / routePath.length) * 100)}%</Text>
              </View>
            </View>
            <TouchableOpacity
              className="bg-green-600 py-3 rounded-xl items-center mt-4"
              onPress={() => setStatus('completed')}
            >
              <Text className="text-white font-bold">Complete Ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'completed' && (
          <View>
            <Text className="text-2xl font-bold text-green-600 mb-4 text-center">
              Ride Completed!
            </Text>
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-gray-900 font-bold mb-2">Ride Summary</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Distance</Text>
                <Text>{distance.toFixed(1)} km</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Vehicle</Text>
                <Text className="capitalize">{vehicleType}</Text>
              </View>
              <View className="border-t border-gray-300 my-2" />
              <View className="flex-row justify-between">
                <Text className="font-bold">Total</Text>
                <Text className="font-bold text-green-600">
                  ₹{Math.round(estimatedFare)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-xl items-center mb-3"
              onPress={() => navigation.popToTop()}
            >
              <Text className="text-white font-bold">Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width,
    height,
  },
});
        setDriverLocation({ latitude: 12.9716, longitude: 77.5946 }); // Bangalore
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Mock coordinates for demonstration
  const pickupCoords = { latitude: 12.9716, longitude: 77.5946 };
  const dropoffCoords = { latitude: 12.9352, longitude: 77.6245 };

  return (
    <View className="flex-1">
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          ...pickupCoords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {/* Pickup marker */}
        <Marker
          coordinate={pickupCoords}
          title="Pickup"
          description={pickup}
          pinColor="green"
        />

        {/* Dropoff marker */}
        <Marker
          coordinate={dropoffCoords}
          title="Dropoff"
          description={dropoff}
          pinColor="red"
        />

        {/* Route line */}
        <Polyline
          coordinates={[pickupCoords, dropoffCoords]}
          strokeColor="#3B82F6"
          strokeWidth={4}
        />

        {/* Driver marker */}
        {driverLocation && status !== 'searching' && (
          <Marker
            coordinate={driverLocation}
            title={driver?.name}
            description={driver?.vehicle}
          />
        )}
      </Map>

      {/* Status Bar */}
      <View className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-bold text-gray-900">
              {status === 'searching' ? 'Finding driver...' : 'Driver Found'}
            </Text>
            {driver && (
              <Text className="text-sm text-gray-600">
                {driver.name} • {driver.rating}★
              </Text>
            )}
          </View>

          {status === 'searching' ? (
            <ActivityIndicator size="large" color="#3B82F6" />
          ) : (
            <TouchableOpacity
              className="bg-blue-600 px-4 py-2 rounded-lg"
              onPress={() => navigation.navigate('Chat')}
            >
              <Text className="text-white font-medium">Call</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress steps */}
        <View className="flex-row items-center mt-4">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              ['searching', 'accepted', 'arriving', 'ongoing', 'completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          >
            <Text className="text-white text-xs">✓</Text>
          </View>
          <View
            className={`flex-1 h-1 mx-2 ${
              ['accepted', 'arriving', 'ongoing', 'completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              ['arriving', 'ongoing', 'completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          >
            <Text className="text-white text-xs">📍</Text>
          </View>
          <View
            className={`flex-1 h-1 mx-2 ${
              ['ongoing', 'completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              ['completed'].includes(status)
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          >
            <Text className="text-white text-xs">🏁</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl">
        {status === 'searching' && (
          <View>
            <Text className="text-center text-lg font-bold text-gray-900 mb-2">
              Searching for nearby {vehicleType}s
            </Text>
            <Text className="text-center text-gray-500">
              Finding the best driver for you...
            </Text>
            <ActivityIndicator size="large" color="#3B82F6" className="mt-6" />
          </View>
        )}

        {status === 'accepted' && driver && (
          <View>
            <View className="flex-row items-center mb-4">
              <View className="h-16 w-16 rounded-full bg-blue-100 items-center justify-center mr-4">
                <Text className="text-2xl">
                  {vehicleType === 'bike' ? '🏍️' : vehicleType === 'auto' ? '🛻' : '🚗'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold">{driver.name}</Text>
                <Text className="text-gray-500">
                  {vehicleType.toUpperCase()} • {driver.vehicle}
                </Text>
              </View>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 font-bold">{driver.rating}★</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="font-bold text-xl text-gray-900">
                ₹{Math.round(estimatedFare)}
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-full"
                onPress={() => setStatus('arriving')}
              >
                <Text className="text-white font-bold">Driver Arriving</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {status === 'arriving' && (
          <View>
            <Text className="text-lg font-bold mb-4">Driver is arriving</Text>
            <TouchableOpacity
              className="bg-green-600 py-3 rounded-xl items-center"
              onPress={() => setStatus('ongoing')}
            >
              <Text className="text-white font-bold">Start Ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'ongoing' && (
          <View>
            <Text className="text-lg font-bold mb-4">Ride in progress</Text>
            <View className="flex-row justify-between items-center bg-blue-50 p-4 rounded-xl">
              <View>
                <Text className="text-gray-500 text-sm">Distance</Text>
                <Text className="font-bold">{distance.toFixed(1)} km</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Fare</Text>
                <Text className="font-bold">₹{Math.round(estimatedFare)}</Text>
              </View>
            </View>
            <TouchableOpacity
              className="bg-green-600 py-3 rounded-xl items-center mt-4"
              onPress={() => setStatus('completed')}
            >
              <Text className="text-white font-bold">Complete Ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'completed' && (
          <View>
            <Text className="text-2xl font-bold text-green-600 mb-4 text-center">
              Ride Completed!
            </Text>
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-gray-900 font-bold mb-2">Ride Summary</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Distance</Text>
                <Text>{distance.toFixed(1)} km</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Vehicle</Text>
                <Text className="capitalize">{vehicleType}</Text>
              </View>
              <View className="border-t border-gray-300 my-2" />
              <View className="flex-row justify-between">
                <Text className="font-bold">Total</Text>
                <Text className="font-bold text-green-600">
                  ₹{Math.round(estimatedFare)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-xl items-center mb-3"
              onPress={() => {
                // Navigate to payment
                navigation.popToTop();
              }}
            >
              <Text className="text-white font-bold">Pay Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-2 items-center"
              onPress={() => navigation.popToTop()}
            >
              <Text className="text-gray-500">Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width,
    height,
  },
});