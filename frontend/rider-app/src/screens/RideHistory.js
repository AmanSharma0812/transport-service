import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function RideHistory() {
  const [rides, setRides] = useState([]);

  const mockRides = [
    {
      id: '1',
      rideId: 'QR123ABC',
      date: '2024-01-15 10:30 AM',
      from: 'MG Road, Bangalore',
      to: 'Whitefield, Bangalore',
      vehicle: 'bike',
      status: 'completed',
      distance: '12.5 km',
      duration: '35 mins',
      fare: 145,
    },
    {
      id: '2',
      rideId: 'QR456DEF',
      date: '2024-01-14 6:45 PM',
      from: 'Koramangala, Bangalore',
      to: 'Indiranagar, Bangalore',
      vehicle: 'auto',
      status: 'completed',
      distance: '8.2 km',
      duration: '28 mins',
      fare: 186,
    },
    {
      id: '3',
      rideId: 'QR789GHI',
      date: '2024-01-12 9:15 AM',
      from: 'HSR Layout, Bangalore',
      to: 'Electronic City, Bangalore',
      vehicle: 'cab',
      status: 'cancelled',
      distance: '-',
      duration: '-',
      fare: 0,
    },
  ];

  useEffect(() => {
    setRides(mockRides);
  }, []);

  const renderRide = ({ item }) => (
    <View className="bg-white mx-4 my-2 p-4 rounded-xl shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-sm text-gray-500">{item.date}</Text>
          <Text className="font-bold text-gray-900">{item.rideId}</Text>
        </View>
        <View
          className={`px-3 py-1 rounded-full ${
            item.status === 'completed'
              ? 'bg-green-100'
              : item.status === 'cancelled'
              ? 'bg-red-100'
              : 'bg-yellow-100'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              item.status === 'completed'
                ? 'text-green-800'
                : item.status === 'cancelled'
                ? 'text-red-800'
                : 'text-yellow-800'
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View className="mb-3">
        <View className="flex-row items-start mb-2">
          <Icon name="location" size={16} color="#10B981" />
          <Text className="ml-2 flex-1">{item.from}</Text>
        </View>
        <View className="flex-row items-start">
          <Icon name="flag" size={16} color="#EF4444" />
          <Text className="ml-2 flex-1">{item.to}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <View className="flex-row items-center">
          <Text className="capitalize text-gray-600 mr-2">
            {item.vehicle}
          </Text>
          <Text className="text-gray-400">•</Text>
          <Text className="text-gray-600 ml-2">{item.distance}</Text>
          <Text className="text-gray-400 ml-2">•</Text>
          <Text className="text-gray-600 ml-2">{item.duration}</Text>
        </View>
        <Text className="font-bold text-lg text-gray-900">
          {item.fare > 0 ? `₹${item.fare}` : '-'}
        </Text>
      </View>

      {item.status === 'completed' && (
        <TouchableOpacity className="mt-3 py-2 border border-blue-500 rounded-lg items-center">
          <Text className="text-blue-600 font-medium">View Invoice</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 pt-4">
      <Text className="text-2xl font-bold text-gray-900 px-4 mb-4">
        Your Rides
      </Text>
      <FlatList
        data={rides}
        renderItem={renderRide}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}