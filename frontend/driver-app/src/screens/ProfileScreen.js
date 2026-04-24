import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen() {
  const driver = {
    name: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'rajesh@example.com',
    rating: 4.8,
    totalRides: 342,
    vehicle: 'Bajaj Pulsar',
    registrationNumber: 'KA 01 AB 1234',
    memberSince: 'March 2023',
  };

  const menuItems = [
    { icon: 'document-text-outline', title: 'Documents', subtitle: 'Upload verification' },
    { icon: 'settings-outline', title: 'Settings', subtitle: 'App preferences' },
    { icon: 'help-circle-outline', title: 'Help & Support', subtitle: '24/7 assistance' },
    { icon: 'information-circle-outline', title: 'About', subtitle: 'Version 1.0.0' },
  ];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-green-600 pt-12 pb-20 rounded-b-3xl px-6">
        <View className="flex-row items-center">
          <View className="h-20 w-20 rounded-full bg-white items-center justify-center">
            <Text className="text-3xl font-bold text-green-600">
              {driver.name.charAt(0)}
            </Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-white">{driver.name}</Text>
            <Text className="text-green-100">{driver.phone}</Text>
            <Text className="text-green-200 text-sm mt-1">
              {driver.memberSince}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="mx-4 -mt-12 bg-white rounded-2xl shadow-lg p-4">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">
              {driver.totalRides}
            </Text>
            <Text className="text-gray-500 text-sm">Rides</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-yellow-600">
              {driver.rating}
            </Text>
            <Text className="text-gray-500 text-sm">Rating</Text>
          </View>
        </View>
      </View>

      {/* Vehicle Info */}
      <View className="mx-4 mt-6 bg-white rounded-2xl p-6 shadow-sm">
        <Text className="text-lg font-bold text-gray-900 mb-4">
          Vehicle Details
        </Text>
        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Vehicle Type</Text>
            <Text className="font-medium text-gray-900">
              {driver.vehicle}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Registration</Text>
            <Text className="font-medium text-gray-900">
              {driver.registrationNumber}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Verification</Text>
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-sm font-medium">
                Verified
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View className="mt-6 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center px-4 py-4 border-b border-gray-100 last:border-b-0"
          >
            <Icon name={item.icon} size={24} color="#6B7280" />
            <View className="ml-4 flex-1">
              <Text className="text-gray-900 font-medium">{item.title}</Text>
              <Text className="text-gray-500 text-sm">{item.subtitle}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        className="mx-4 mb-12 bg-red-50 py-4 rounded-xl items-center border border-red-200"
        onPress={handleLogout}
      >
        <Text className="text-red-600 font-bold">Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});