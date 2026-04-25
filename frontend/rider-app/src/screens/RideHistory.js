import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function RideHistory() {
  const [rides, setRides] = useState([]);

  const mockRides = [
    {
      id: '1',
      rideId: 'QR123ABC',
      date: '2024-01-15 10:30 AM',
      from: 'MG Road, Bangalore',
      to: 'Whitefield, Bangalore',
      vehicle: 'Bike',
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
      vehicle: 'Auto',
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
      vehicle: 'Cab',
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
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={styles.idText}>{item.rideId}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === 'completed' ? '#D1FAE5' : '#FEE2E2',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: item.status === 'completed' ? '#065F46' : '#991B1B',
              },
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.addressText} numberOfLines={1}>{item.from}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.addressText} numberOfLines={1}>{item.to}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <Text style={styles.vehicleText}>{item.vehicle}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.statText}>{item.distance}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.statText}>{item.duration}</Text>
        </View>
        <Text style={styles.fareText}>
          {item.fare > 0 ? `₹${item.fare}` : '-'}
        </Text>
      </View>

      {item.status === 'completed' && (
        <TouchableOpacity style={styles.invoiceButton}>
          <Text style={styles.invoiceButtonText}>View Invoice</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Rides</Text>
      </View>
      <FlatList
        data={rides}
        renderItem={renderRide}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  idText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  line: {
    width: 2,
    height: 12,
    backgroundColor: '#E5E7EB',
    marginLeft: 3,
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  dotSeparator: {
    marginHorizontal: 8,
    color: '#D1D5DB',
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  fareText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  invoiceButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563EB',
    alignItems: 'center',
  },
  invoiceButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
});