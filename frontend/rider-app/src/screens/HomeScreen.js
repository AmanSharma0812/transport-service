import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { riderAPI } from '../services/api';
import { riderAPI } from '../services/api';

const VEHICLE_TYPES = [
  {
    id: 'bike',
    name: 'Bike',
    icon: '🏍️',
    baseFare: 20,
    perKm: 8,
  },
  {
    id: 'auto',
    name: 'Auto',
    icon: '🛻',
    baseFare: 30,
    perKm: 12,
  },
  {
    id: 'cab',
    name: 'Cab',
    icon: '🚗',
    baseFare: 50,
    perKm: 18,
  },
];

export default function HomeScreen() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('bike');
  const [showFareEstimate, setShowFareEstimate] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [distance, setDistance] = useState(0);
  const [booking, setBooking] = useState(false);
  const navigation = useNavigation();

  const estimateFare = () => {
    if (!pickup || !dropoff) {
      Alert.alert('Required', 'Please enter both pickup and drop locations');
      return;
    }

    // Mock distance calculation
    const mockDistance = Math.random() * 20 + 2; // 2-22 km
    setDistance(mockDistance);

    const vehicle = VEHICLE_TYPES.find((v) => v.id === selectedVehicle);
    const fare = vehicle.baseFare + mockDistance * vehicle.perKm;
    setEstimatedFare(fare);
    setShowFareEstimate(true);
  };

  const bookRide = async () => {
    if (!pickup || !dropoff) {
      Alert.alert('Required', 'Please enter both pickup and drop locations');
      return;
    }

    setBooking(true);
    try {
      const response = await riderAPI.bookRide({
        pickupLat: 12.9716,
        pickupLng: 77.5946,
        pickupAddress: pickup,
        dropoffLat: 12.9352,
        dropoffLng: 77.6245,
        dropoffAddress: dropoff,
        vehicleType: selectedVehicle,
        paymentMethod: 'cash',
      });

      setBooking(false);
      Alert.alert('Success', 'Ride booked! Finding a driver...', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Map', {
              pickup,
              dropoff,
              vehicleType: selectedVehicle,
              estimatedFare,
              distance,
              rideId: response.data.data.rideId,
            });
          },
        },
      ]);
    } catch (error) {
      setBooking(false);
      console.error('Booking error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to book ride');
    }
  };

  const bookRide = async () => {
    if (!pickup || !dropoff) {
      Alert.alert('Required', 'Please enter both pickup and drop locations');
      return;
    }

    setBooking(true);
    try {
      // In a real app, you'd get actual coordinates from geocoding
      // For demo, using fixed coordinates
      const response = await riderAPI.bookRide({
        pickupLat: 12.9716,
        pickupLng: 77.5946,
        pickupAddress: pickup,
        dropoffLat: 12.9352,
        dropoffLng: 77.6245,
        dropoffAddress: dropoff,
        vehicleType: selectedVehicle,
        paymentMethod: 'cash',
      });

      setBooking(false);
      Alert.alert('Success', 'Ride booked! Finding a driver...', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to map to show driver animation
            navigation.navigate('Map', {
              pickup,
              dropoff,
              vehicleType: selectedVehicle,
              estimatedFare,
              distance,
              rideId: response.data.data.rideId,
            });
          },
        },
      ]);
    } catch (error) {
      setBooking(false);
      console.error('Booking error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to book ride');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Location Inputs */}
      <View className="bg-white mx-4 mt-6 rounded-2xl shadow-lg p-4">
        {/* Pickup */}
        <View className="flex-row items-center py-3 border-b border-gray-100">
          <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-3">
            <Text className="text-white text-xs">A</Text>
          </View>
          <TextInput
            className="flex-1 text-base"
            placeholder="Enter pickup location"
            value={pickup}
            onChangeText={setPickup}
          />
        </View>

        {/* Dropoff */}
        <View className="flex-row items-center py-3">
          <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-3">
            <Text className="text-white text-xs">B</Text>
          </View>
          <TextInput
            className="flex-1 text-base"
            placeholder="Where to?"
            value={dropoff}
            onChangeText={setDropoff}
          />
        </View>
      </View>

      {/* Vehicle Selection */}
      <Text className="text-lg font-bold text-gray-900 mx-4 mt-8 mb-4">
        Select Vehicle
      </Text>
      <View className="flex-row justify-around px-4 mb-6">
        {VEHICLE_TYPES.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            className={`p-4 rounded-2xl items-center flex-1 mx-2 ${
              selectedVehicle === vehicle.id
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-white border border-gray-200'
            }`}
            onPress={() => setSelectedVehicle(vehicle.id)}
          >
            <Text className="text-4xl mb-2">{vehicle.icon}</Text>
            <Text className="font-bold text-gray-900">{vehicle.name}</Text>
            <Text className="text-gray-500 text-sm mt-1">
              ₹{vehicle.baseFare} + ₹{vehicle.perKm}/km
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Estimate Fare Button */}
          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-xl items-center"
            onPress={bookRide}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">Book Now</Text>
            )}
          </TouchableOpacity>

      {/* Fare Estimate Modal */}
      {showFareEstimate && (
        <View className="mx-4 bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Fare Estimate
          </Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Distance</Text>
            <Text className="font-medium">{distance.toFixed(1)} km</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Vehicle</Text>
            <Text className="font-medium capitalize">{selectedVehicle}</Text>
          </View>

          <View className="border-t border-gray-200 my-3" />

          <View className="flex-row justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Total</Text>
            <Text className="text-2xl font-bold text-green-600">
              ₹{Math.round(estimatedFare)}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-blue-600 py-3 rounded-xl items-center"
            onPress={bookRide}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">Book Now</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 items-center"
            onPress={() => setShowFareEstimate(false)}
          >
            <Text className="text-gray-500">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recent Locations / Offers */}
      <View className="px-4 pb-8">
        <Text className="text-lg font-bold text-gray-900 mb-4">Offers</Text>
        <View className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6">
          <Text className="text-white text-2xl font-bold mb-2">
            🎉 Welcome Bonus
          </Text>
          <Text className="text-white/90 mb-4">
            Get ₹50 off on your first 3 rides
          </Text>
          <Text className="text-white font-medium">Use code: FIRST50</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
