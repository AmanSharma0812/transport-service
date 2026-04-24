import 'react-native-gesture-handler';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { io } from 'socket.io-client';
import { Alert, Modal, View, Text, TouchableOpacity } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import OTPVerification from './src/screens/OTPVerification';
import HomeScreen from './src/screens/HomeScreen';
import RideScreen from './src/screens/RideScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Ride Request Modal Component
function RideRequestModal({ visible, rideData, onAccept, onDecline }) {
  if (!rideData) return null;

  return (
    <Modal
      visible={visible}
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

          <View className="space-y-4 mb-6">
            <View className="bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-start mb-3">
                <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-3">
                  <Text className="text-white text-xs">A</Text>
                </View>
                <Text className="flex-1">{rideData.pickup.address}</Text>
              </View>
              <View className="flex-row items-start">
                <View className="w-6 h-6 rounded-full bg-red-500 items-center justify-center mr-3">
                  <Text className="text-white text-xs">B</Text>
                </View>
                <Text className="flex-1">{rideData.dropoff.address}</Text>
              </View>
            </View>

            <View className="flex-row justify-between p-4 border border-gray-200 rounded-xl">
              <Text className="text-gray-600">Estimated Fare</Text>
              <Text className="text-2xl font-bold text-green-600">
                ₹{Math.round(rideData.totalFare)}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text className="text-gray-600 mr-3">Vehicle:</Text>
              <Text className="font-bold capitalize">{rideData.vehicleType}</Text>
            </View>
          </View>

          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="flex-1 bg-red-500 py-4 rounded-xl items-center"
              onPress={onDecline}
            >
              <Text className="text-white font-bold">Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-green-500 py-4 rounded-xl items-center"
              onPress={onAccept}
            >
              <Text className="text-white font-bold">Accept Ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TabNavigator() {
  const socket = useSocket();
  const navigation = useNavigation();
  const [pendingRide, setPendingRide] = useState(null);
  const [rideModalVisible, setRideModalVisible] = useState(false);

  // Listen for new ride requests via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewRideRequest = (rideData) => {
      console.log('New ride request:', rideData);
      setPendingRide(rideData);
      setRideModalVisible(true);
    };

    socket.on('newRideRequest', handleNewRideRequest);
    return () => socket.off('newRideRequest', handleNewRideRequest);
  }, [socket]);

  const acceptRide = () => {
    if (pendingRide) {
      navigation.navigate('Ride', {
        ride: pendingRide,
        status: 'accepted',
      });
      setRideModalVisible(false);
      setPendingRide(null);
    }
  };

  const declineRide = () => {
    setRideModalVisible(false);
    setPendingRide(null);
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = '';
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Earnings') {
              iconName = focused ? 'cash' : 'cash-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Earnings" component={EarningsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <RideRequestModal
        visible={rideModalVisible}
        rideData={pendingRide}
        onAccept={acceptRide}
        onDecline={declineRide}
      />
    </>
  );
}

export default function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerification} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="Ride"
            component={RideScreen}
            options={{
              presentation: 'fullScreenModal',
              headerShown: true,
              headerTitle: 'Active Ride',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketContext.Provider>
  );
}
