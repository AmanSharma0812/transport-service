import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState({
    today: 450,
    week: 2850,
    month: 12400,
    recentRides: [
      { id: '1', date: 'Today, 2:30 PM', fare: 125, type: 'Bike' },
      { id: '2', date: 'Today, 11:15 AM', fare: 85, type: 'Bike' },
      { id: '3', date: 'Yesterday, 6:45 PM', fare: 240, type: 'Cab' },
      { id: '4', date: 'Yesterday, 4:20 PM', fare: 150, type: 'Auto' },
    ]
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Stats */}
        <View style={styles.mainCard}>
          <Text style={styles.totalLabel}>Today's Earnings</Text>
          <Text style={styles.totalValue}>₹{earnings.today}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>+12% from yesterday</Text>
          </View>
        </View>

        {/* Other periods */}
        <View style={styles.periodRow}>
          <View style={styles.periodCard}>
            <Text style={styles.periodLabel}>This Week</Text>
            <Text style={styles.periodValue}>₹{earnings.week}</Text>
          </View>
          <View style={styles.periodCard}>
            <Text style={styles.periodLabel}>This Month</Text>
            <Text style={styles.periodValue}>₹{earnings.month}</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Rides</Text>
        {earnings.recentRides.map((ride) => (
          <View key={ride.id} style={styles.rideItem}>
            <View style={styles.rideInfo}>
              <Text style={styles.rideType}>{ride.type}</Text>
              <Text style={styles.rideDate}>{ride.date}</Text>
            </View>
            <Text style={styles.rideFare}>+₹{ride.fare}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
  },
  mainCard: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  periodCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodLabel: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  periodValue: {
    color: '#111827',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  rideItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rideInfo: {
    flex: 1,
  },
  rideType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  rideDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rideFare: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
});