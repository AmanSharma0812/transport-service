import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { driverAPI } from '../services/api';
import { useSocket } from '../App';

export default function HomeScreen({ navigation }) {
  const socket = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayRides: 0,
    weeklyEarnings: 0,
    rating: 0,
  });
  const [pendingRide, setPendingRide] = useState(null);
  const [rideModalVisible, setRideModalVisible] = useState(false);

  // Fetch driver dashboard stats
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await driverAPI.getDashboard();
      const data = response.data.data;
      setStats({
        todayEarnings: data.stats.today.earnings,
        todayRides: data.stats.today.rides,
        weeklyEarnings: data.stats.week.rides * 150, // Mock
        rating: data.stats.rating,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const toggleOnline = async () => {
    if (!isOnline) {
      // Going online - check if verified
      // For demo, we assume verified
    }

    setLoading(true);
    try {
      await driverAPI.toggleStatus(!isOnline);
      setIsOnline(!isOnline);
      // Update socket room join
      if (socket) {
        if (!isOnline) {
          socket.emit('join', { userId: 'driver-id', role: 'driver' });
        } else {
          socket.emit('leave', { userId: 'driver-id', role: 'driver' });
        }
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // Listen for new ride requests via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewRideRequest = (rideData) => {
      console.log('New ride request:', rideData);
      setPendingRide(rideData);
      setRideModalVisible(true);
    };

    socket.on('newRideRequest', handleNewRideRequest);

    return () => {
      socket.off('newRideRequest', handleNewRideRequest);
    };
  }, [socket]);

  const acceptRide = async () => {
    if (!pendingRide) return;

    try {
      // Navigate to Ride screen first to show animation
      navigation.navigate('Ride', {
        ride: pendingRide,
        status: 'accepted',
      });

      // Call accept API
      // await driverAPI.acceptRide(pendingRide.rideId);
      setRideModalVisible(false);
      setPendingRide(null);
    } catch (error) {
      console.error('Failed to accept ride:', error);
      Alert.alert('Error', 'Failed to accept ride');
    }
  };

  const declineRide = () => {
    setRideModalVisible(false);
    setPendingRide(null);
  };

  return (
    <View className="flex-1 bg-gray-50 pt-8 px-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-gray-500 text-sm">Welcome back,</Text>
          <Text className="text-xl font-bold text-gray-900">Rajesh Kumar</Text>
        </View>
        <View className="h-12 w-12 rounded-full bg-blue-100 items-center justify-center">
          <Icon name="person" size={24} color="#3B82F6" />
        </View>
      </View>

      {/* Online Toggle */}
      <View className="mb-6">
        <TouchableOpacity
          className={`py-6 rounded-2xl items-center ${
            isOnline ? 'bg-green-500' : 'bg-gray-300'
          }`}
          onPress={toggleOnline}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <>
              <Icon
                name={isOnline ? 'wifi' : 'wifi-outline'}
                size={32}
                color="white"
              />
              <Text className="text-white font-bold text-xl mt-2">
                {isOnline ? 'You are Online' : 'Go Online'}
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                {isOnline
                  ? 'Accepting ride requests'
                  : 'Tap to start receiving requests'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-4">
          Today's Overview
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-3xl font-bold text-green-600">
              ₹{stats.todayEarnings}
            </Text>
            <Text className="text-gray-500">Earnings</Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-bold text-blue-600">
              {stats.todayRides}
            </Text>
            <Text className="text-gray-500">Rides</Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-bold text-yellow-600">
              {stats.rating}
            </Text>
            <Text className="text-gray-500">Rating</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="space-y-4">
        <TouchableOpacity
          className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100"
          onPress={() => {}}
        >
          <Icon name="document-text-outline" size={24} color="#3B82F6" />
          <View className="ml-4 flex-1">
            <Text className="font-bold text-gray-900">Document Verification</Text>
            <Text className="text-gray-500 text-sm">Complete your profile</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100"
          onPress={() => {}}
        >
          <Icon name="cash-outline" size={24} color="#10B981" />
          <View className="ml-4 flex-1">
            <Text className="font-bold text-gray-900">Weekly Earnings</Text>
            <Text className="text-gray-500 text-sm">
              ₹{stats.weeklyEarnings} this week
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100"
          onPress={() => {}}
        >
          <Icon name="location-outline" size={24} color="#F59E0B" />
          <View className="ml-4 flex-1">
            <Text className="font-bold text-gray-900">Current Location</Text>
            <Text className="text-gray-500 text-sm">Bangalore, Karnataka</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SOS Button */}
      <TouchableOpacity
        className="mt-8 bg-red-100 py-4 rounded-xl flex-row items-center justify-center"
      >
        <Icon name="warning" size={24} color="#EF4444" />
        <Text className="ml-2 text-red-600 font-bold">Emergency SOS</Text>
      </TouchableOpacity>

      {/* Ride Request Modal */}
      <Modal
        visible={rideModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center">
                <Text className="text-3xl">🏍️</Text>
              </View>
              <Text className="text-xl font-bold mt-4">New Ride Request</Text>
            </View>

            {pendingRide && (
              <View className="space-y-4 mb-6">
                <View className="bg-gray-50 rounded-xl p-4">
                  <View className="flex-row items-start mb-3">
                    <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-3">
                      <Text className="text-white text-xs">A</Text>
                    </View>
                    <Text className="flex-1">{pendingRide.pickup.address}</Text>
                  </View>
                  <View className="flex-row items-start">
                    <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-3">
                      <Text className="text-white text-xs">B</Text>
                    </View>
                    <Text className="flex-1">{pendingRide.dropoff.address}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between p-4 border border-gray-200 rounded-xl">
                  <Text className="text-gray-600">Estimated Fare</Text>
                  <Text className="text-2xl font-bold text-green-600">
                    ₹{Math.round(pendingRide.totalFare)}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-gray-600 mr-3">Vehicle:</Text>
                  <Text className="font-bold capitalize">{pendingRide.vehicleType}</Text>
                </View>
              </View>
            )}

            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 bg-red-500 py-4 rounded-xl items-center"
                onPress={declineRide}
              >
                <Text className="text-white font-bold">Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-green-500 py-4 rounded-xl items-center"
                onPress={acceptRide}
              >
                <Text className="text-white font-bold">Accept Ride</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({});
