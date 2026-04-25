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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>QuickRide</Text>
      </View>

      {/* Location Inputs */}
      <View style={styles.card}>
        <View style={styles.inputRow}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]}>
            <Text style={styles.dotText}>A</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Enter pickup location"
            value={pickup}
            onChangeText={setPickup}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.inputRow}>
          <View style={[styles.dot, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.dotText}>B</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Where to?"
            value={dropoff}
            onChangeText={setDropoff}
          />
        </View>
      </View>

      {/* Vehicle Selection */}
      <Text style={styles.sectionTitle}>Select Vehicle</Text>
      <View style={styles.vehicleRow}>
        {VEHICLE_TYPES.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={[
              styles.vehicleCard,
              selectedVehicle === vehicle.id ? styles.vehicleCardActive : styles.vehicleCardInactive,
            ]}
            onPress={() => setSelectedVehicle(vehicle.id)}
          >
            <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
            <Text style={styles.vehicleName}>{vehicle.name}</Text>
            <Text style={styles.vehicleFare}>₹{vehicle.baseFare}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.mainButton} onPress={estimateFare}>
        <Text style={styles.mainButtonText}>Check Price</Text>
      </TouchableOpacity>

      {showFareEstimate && (
        <View style={styles.estimateCard}>
          <Text style={styles.estimateTitle}>Fare Estimate</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Distance</Text>
            <Text style={styles.fareValue}>{distance.toFixed(1)} km</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Total Fare</Text>
            <Text style={styles.totalFare}>₹{Math.round(estimatedFare)}</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={bookRide}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.bookButtonText}>Book Now</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Offers Section */}
      <View style={styles.offersSection}>
        <Text style={styles.sectionTitle}>Special Offers</Text>
        <View style={styles.offerCard}>
          <Text style={styles.offerEmoji}>🎉</Text>
          <View>
            <Text style={styles.offerTitle}>Welcome Bonus</Text>
            <Text style={styles.offerSubtitle}>Get ₹50 off on first 3 rides</Text>
            <Text style={styles.promoCode}>Code: FIRST50</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dotText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 36,
    marginVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  vehicleCard: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  vehicleCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  vehicleCardInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F3F4F6',
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  vehicleName: {
    fontWeight: 'bold',
    color: '#111827',
  },
  vehicleFare: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  mainButton: {
    backgroundColor: '#2563EB',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  estimateCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  estimateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fareLabel: {
    color: '#6B7280',
    fontSize: 16,
  },
  fareValue: {
    fontWeight: '600',
    color: '#111827',
  },
  totalFare: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  bookButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  offersSection: {
    marginTop: 8,
    paddingBottom: 32,
  },
  offerCard: {
    backgroundColor: '#4F46E5',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  offerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  offerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  promoCode: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 8,
  },
});
