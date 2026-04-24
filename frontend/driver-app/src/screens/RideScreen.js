import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// Generate intermediate points along path for smooth animation
const generatePath = (start, end, segments = 100) => {
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

export default function RideScreen() {
  const [ride, setRide] = useState({
    status: 'searching',
    rider: {
      name: 'Rahul Sharma',
      phone: '+91 9876543210',
    },
    pickup: { address: 'MG Road, Bangalore', coords: { latitude: 12.9716, longitude: 77.5946 } },
    dropoff: { address: 'Whitefield, Bangalore', coords: { latitude: 12.9352, longitude: 77.6245 } },
    distance: 12.5,
    fare: 145,
  });
  const [driverLocation, setDriverLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const animationRef = useRef(null);

  // Driver starts from somewhere nearby
  const driverStartCoords = { latitude: 12.9850, longitude: 77.6050 };

  // Generate route path when status changes
  useEffect(() => {
    if (ride.status === 'accepted' || ride.status === 'arriving') {
      const path = generatePath(driverStartCoords, ride.pickup.coords, 100);
      setRoutePath(path);
      setCurrentPathIndex(0);
      setDriverLocation(driverStartCoords);
    } else if (ride.status === 'ongoing') {
      const path = generatePath(ride.pickup.coords, ride.dropoff.coords, 100);
      setRoutePath(path);
      setCurrentPathIndex(0);
      setDriverLocation(ride.pickup.coords);
    }
  }, [ride.status]);

  // Animate driver along path
  useEffect(() => {
    if (ride.status === 'accepted' || ride.status === 'arriving' || ride.status === 'ongoing') {
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
  }, [ride.status, routePath]);

  // Simulate ride status change
  useEffect(() => {
    if (ride.status === 'searching') {
      const timer = setTimeout(() => {
        setRide({ ...ride, status: 'accepted' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [ride.status]);

  const updateStatus = (newStatus) => {
    setRide({ ...ride, status: newStatus });
  };

  const callRider = () => {
    Alert.alert('Call', `Calling ${ride.rider.name} at ${ride.rider.phone}`);
  };

  const renderActionButton = () => {
    switch (ride.status) {
      case 'searching':
        return (
          <TouchableOpacity className="bg-blue-600 py-4 rounded-xl items-center">
            <Text className="text-white font-bold">
              Waiting for requests...
            </Text>
          </TouchableOpacity>
        );
      case 'accepted':
        return (
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-green-600 py-3 rounded-xl items-center mr-2"
                onPress={() => updateStatus('arriving')}
              >
                <Text className="text-white font-bold">Arriving</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-600 py-3 rounded-xl items-center ml-2"
                onPress={() => Alert.alert('Ride Cancelled', 'You cancelled the ride')}
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-blue-100 py-3 rounded-xl items-center"
              onPress={callRider}
            >
              <Text className="text-blue-600 font-bold">Call Rider</Text>
            </TouchableOpacity>
          </View>
        );
      case 'arriving':
        return (
          <TouchableOpacity
            className="bg-green-600 py-4 rounded-xl items-center"
            onPress={() => updateStatus('ongoing')}
          >
            <Text className="text-white font-bold">Start Ride</Text>
          </TouchableOpacity>
        );
      case 'ongoing':
        return (
          <TouchableOpacity
            className="bg-green-600 py-4 rounded-xl items-center"
            onPress={() => updateStatus('completed')}
          >
            <Text className="text-white font-bold">Complete Ride</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1">
      {/* Map */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: ride.pickup.coords.latitude,
          longitude: ride.pickup.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {/* Pickup marker */}
        <Marker
          coordinate={ride.pickup.coords}
          title="Pickup"
          description={ride.pickup.address}
          pinColor="green"
        />

        {/* Dropoff marker */}
        <Marker
          coordinate={ride.dropoff.coords}
          title="Dropoff"
          description={ride.dropoff.address}
          pinColor="red"
        />

        {/* Planned route (dashed) */}
        <Polyline
          coordinates={[ride.pickup.coords, ride.dropoff.coords]}
          strokeColor="#3B82F6"
          strokeWidth={4}
          strokePattern={[1, 3]}
        />

        {/* Driver animated marker */}
        {driverLocation && ride.status !== 'searching' && (
          <Marker
            coordinate={driverLocation}
            title="You"
            description="Your location"
          >
            <View className="bg-green-500 rounded-full p-3 border-2 border-white shadow-lg">
              <Icon name="car" size={24} color="white" />
            </View>
          </Marker>
        )}

        {/* Circle at pickup when arriving */}
        {ride.status === 'arriving' && driverLocation && (
          <Circle
            center={ride.pickup.coords}
            radius={20}
            strokeColor="#10B981"
            fillColor="rgba(16, 185, 129, 0.2)"
          />
        )}
      </MapView>

      {/* Bottom Sheet */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-2xl">
        {/* Rider Info */}
        <View className="flex-row items-center mb-6">
          <View className="h-14 w-14 rounded-full bg-green-100 items-center justify-center mr-4">
            <Icon name="person" size={28} color="#10B981" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold">{ride.rider.name}</Text>
            <Text className="text-gray-500">{ride.rider.phone}</Text>
          </View>
          <TouchableOpacity
            className="bg-green-100 p-3 rounded-full"
            onPress={callRider}
          >
            <Icon name="call" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Ride Details */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <View className="flex-row items-start mb-3">
            <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-3">
              <Text className="text-white text-xs">A</Text>
            </View>
            <Text className="flex-1">{ride.pickup.address}</Text>
          </View>
          <View className="flex-row items-start">
            <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-3">
              <Text className="text-white text-xs">B</Text>
            </View>
            <Text className="flex-1">{ride.dropoff.address}</Text>
          </View>
        </View>

        {/* Fare & Progress */}
        <View className="flex-row justify-between items-center mb-4 p-3 border border-gray-200 rounded-xl">
          <Text className="text-gray-600">Estimated Fare</Text>
          <Text className="text-xl font-bold">₹{ride.fare}</Text>
        </View>

        {ride.status !== 'searching' && ride.status !== 'completed' && (
          <View className="mb-4">
            <Text className="text-center text-sm text-gray-600">
              Progress: {Math.round((currentPathIndex / routePath.length) * 100)}%
            </Text>
          </View>
        )}

        {/* Status Indicator */}
        <View className="mb-4">
          <Text className="text-center font-bold text-gray-900 capitalize">
            {ride.status === 'searching'
              ? '🔄 Searching for rider...'
              : ride.status === 'accepted'
              ? '✅ Ride Accepted • Navigate to pickup'
              : ride.status === 'arriving'
              ? '🚗 Arriving at pickup'
              : ride.status === 'ongoing'
              ? '🛣️ Ride in progress to dropoff'
              : '✓ Completed'}
          </Text>
        </View>

        {/* Action Button */}
        {renderActionButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});