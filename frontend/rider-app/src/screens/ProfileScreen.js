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
  const user = {
    name: 'Rahul Sharma',
    phone: '+91 9876543210',
    email: 'rahul@example.com',
    rides: 24,
    totalSpent: 3240,
    memberSince: 'Jan 2024',
  };

  const menuItems = [
    { icon: 'wallet-outline', title: 'Wallet', value: '₹0' },
    { icon: 'card-outline', title: 'Payment Methods', value: '' },
    { icon: 'settings-outline', title: 'Settings', value: '' },
    { icon: 'help-circle-outline', title: 'Help & Support', value: '' },
    { icon: 'document-text-outline', title: 'Terms & Conditions', value: '' },
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
      <View className="bg-blue-600 pt-12 pb-20 rounded-b-3xl px-6">
        <View className="flex-row items-center">
          <View className="h-20 w-20 rounded-full bg-white items-center justify-center">
            <Text className="text-3xl font-bold text-blue-600">
              {user.name.charAt(0)}
            </Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-2xl font-bold text-white">{user.name}</Text>
            <Text className="text-blue-100">{user.phone}</Text>
            <Text className="text-blue-200 text-sm mt-1">{user.memberSince}</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="mx-4 -mt-12 bg-white rounded-2xl shadow-lg p-4">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">{user.rides}</Text>
            <Text className="text-gray-500 text-sm">Rides</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">
              ₹{user.totalSpent}
            </Text>
            <Text className="text-gray-500 text-sm">Total Spent</Text>
          </View>
        </View>
      </View>

      {/* Menu */}
      <View className="mt-6 mx-4 bg-white rounded-2xl shadow-sm overflow-hidden">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center px-4 py-4 border-b border-gray-100 last:border-b-0"
          >
            <Icon name={item.icon} size={24} color="#6B7280" />
            <Text className="flex-1 ml-4 text-gray-900">{item.title}</Text>
            {item.value ? (
              <Text className="text-gray-500">{item.value}</Text>
            ) : (
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        className="mx-4 mt-6 mb-12 bg-red-50 py-4 rounded-xl items-center border border-red-200"
        onPress={handleLogout}
      >
        <Text className="text-red-600 font-bold">Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});