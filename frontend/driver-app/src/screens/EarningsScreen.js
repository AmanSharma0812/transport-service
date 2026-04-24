import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [earnings, setEarnings] = useState({
    total: 450,
    rides: 4,
    avgPerRide: 112.5,
    commission: 67.5,
    net: 382.5,
  });

  const periods = [
    { id: 'daily', label: 'Today' },
    { id: 'weekly', label: 'Week' },
    { id: 'monthly', label: 'Month' },
  ];

  const recentRides = [
    { id: '1', time: '10:30 AM', from: 'MG Road', to: 'Whitefield', fare: 145 },
    { id: '2', time: '8:15 AM', from: 'Koramangala', to: 'Indiranagar', fare: 110 },
    { id: '3', time: '6:45 PM', from: 'HSR Layout', to: 'Marathahalli', fare: 130 },
    { id: '4', time: '2:30 PM', from: 'BTM Layout', to: 'Jayanagar', fare: 95 },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 pt-8 px-4">
      {/* Period Selector */}
      <View className="flex-row justify-center mb-6">
        <View className="bg-white rounded-full p-1 flex-row shadow-sm">
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              className={`px-6 py-2 rounded-full ${
                selectedPeriod === period.id
                  ? 'bg-green-500'
                  : 'bg-transparent'
              }`}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Text
                className={`font-medium ${
                  selectedPeriod === period.id
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Earnings Card */}
      <View className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 mb-6 shadow-lg">
        <Text className="text-white text-lg mb-2">Total Earnings</Text>
        <Text className="text-white text-4xl font-bold mb-1">
          ₹{earnings.total}
        </Text>
        <View className="flex-row items-center mt-4">
          <View className="bg-white/20 rounded-lg px-3 py-2">
            <Text className="text-white text-sm">
              {earnings.rides} rides
            </Text>
          </View>
          <Text className="text-white/80 ml-3">
            Avg: ₹{earnings.avgPerRide} per ride
          </Text>
        </View>
      </View>

      {/* Breakdown */}
      <View className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-4">Earnings Breakdown</Text>
        <View className="space-y-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Icon name="cash-outline" size={20} color="#10B981" />
              <Text className="ml-2 text-gray-600">Total Collection</Text>
            </View>
            <Text className="font-bold">₹{earnings.total + earnings.commission}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Icon name="remove-circle-outline" size={20} color="#EF4444" />
              <Text className="ml-2 text-gray-600">Platform Fee</Text>
            </View>
            <Text className="font-bold text-red-500">- ₹{earnings.commission}</Text>
          </View>
          <View className="border-t border-gray-200 my-2" />
          <View className="flex-row justify-between items-center">
            <Text className="font-bold text-gray-900">Net Earnings</Text>
            <Text className="text-2xl font-bold text-green-600">
              ₹{earnings.net}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Rides */}
      <View className="bg-white rounded-2xl p-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4">
          Recent Rides ({selectedPeriod})
        </Text>
        <View className="space-y-4">
          {recentRides.map((ride) => (
            <View
              key={ride.id}
              className="flex-row justify-between items-center border-b border-gray-100 pb-3 last:border-0"
            >
              <View>
                <Text className="font-medium text-gray-900">{ride.from}</Text>
                <Text className="text-gray-500 text-sm">to {ride.to}</Text>
                <Text className="text-gray-400 text-xs">{ride.time}</Text>
              </View>
              <Text className="font-bold text-green-600">₹{ride.fare}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});