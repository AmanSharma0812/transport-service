import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { phone } = route.params || {};

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      // You would use refs to focus next TextInput
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Call backend API to verify OTP
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+91${phone}`,
          otp: otpString,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Save token
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-8 justify-center">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</Text>
      <Text className="text-gray-500 mb-8">
        Enter the 6-digit code sent to +91 {phone}
      </Text>

      <View className="flex-row justify-between mb-8">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            className="w-14 h-14 border-2 border-blue-500 rounded-xl text-center text-2xl font-bold text-gray-900 bg-blue-50"
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
          />
        ))}
      </View>

      <TouchableOpacity
        className="bg-blue-600 py-4 rounded-xl items-center"
        onPress={handleVerifyOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Verify OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-6 items-center">
        <Text className="text-blue-600 font-medium">Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
}