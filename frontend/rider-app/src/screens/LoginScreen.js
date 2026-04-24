import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // In production, call backend API to send OTP via Firebase
      setTimeout(() => {
        navigation.navigate('OTPVerification', { phone });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center px-8">
          {/* Logo */}
          <View className="items-center mb-12">
            <View className="h-20 w-20 rounded-2xl bg-blue-600 items-center justify-center mb-4">
              <Text className="text-white font-bold text-3xl">QR</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">QuickRide</Text>
            <Text className="text-gray-500 mt-2">Your ride, your way</Text>
          </View>

          {/* Title */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Welcome
            </Text>
            <Text className="text-gray-500">
              Enter your phone number to continue
            </Text>
          </View>

          {/* Phone Input */}
          <View className="mb-6">
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-4 bg-gray-50">
              <Text className="text-gray-600 font-medium mr-3">+91</Text>
              <TextInput
                className="flex-1 text-lg"
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            className={`py-4 rounded-xl items-center ${
              phone.length === 10 ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            onPress={handleSendOTP}
            disabled={phone.length !== 10 || isLoading}
          >
            <Text className="text-white font-bold text-lg">
              {isLoading ? 'Sending...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <View className="mt-8 items-center">
            <Text className="text-xs text-gray-400 text-center">
              By continuing, you agree to our{' '}
              <Text className="text-blue-600">Terms of Service</Text> and{' '}
              <Text className="text-blue-600">Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({});