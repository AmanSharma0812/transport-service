import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { driverAPI } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    todayEarnings: 450,
    todayRides: 5,
    weeklyEarnings: 2850,
    rating: 4.8,
  });
  const [rideModalVisible, setRideModalVisible] = useState(false);
  const [pendingRide, setPendingRide] = useState(null);

  useEffect(() => {
    // Simulate fetching dashboard
    // In real app, call driverAPI.getDashboard()
  }, []);

  const toggleOnline = async () => {
    setLoading(true);
    try {
      await driverAPI.toggleStatus(!isOnline);
      setIsOnline(!isOnline);
    } catch (error) {
      console.error('Failed to toggle status:', error);
      // For demo, still toggle if backend fails
      setIsOnline(!isOnline);
    } finally {
      setLoading(false);
    }
  };

  const acceptRide = () => {
    setRideModalVisible(false);
    navigation.navigate('Ride', {
      ride: pendingRide,
      status: 'accepted',
    });
  };

  const declineRide = () => {
    setRideModalVisible(false);
    setPendingRide(null);
  };

  // Mock a ride request after 5 seconds of being online
  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        setPendingRide({
          rideId: 'QR999XYZ',
          pickup: { address: 'Indiranagar Metro, Bangalore' },
          dropoff: { address: 'Brigade Road, Bangalore' },
          vehicleType: 'Bike',
          totalFare: 125,
        });
        setRideModalVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.driverName}>Rajesh Kumar</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
        </View>

        {/* Online Toggle */}
        <TouchableOpacity
          style={[styles.statusCard, isOnline ? styles.statusOnline : styles.statusOffline]}
          onPress={toggleOnline}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <>
              <Text style={styles.statusEmoji}>{isOnline ? '🟢' : '⚪'}</Text>
              <Text style={styles.statusTitle}>
                {isOnline ? 'You are Online' : 'Go Online'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {isOnline ? 'Accepting ride requests' : 'Tap to start earning'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Earnings</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>₹{stats.todayEarnings}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today's Rides</Text>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>{stats.todayRides}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.rating}★</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Weekly Total</Text>
            <Text style={styles.statValue}>₹{stats.weeklyEarnings}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionIcon}>📄</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Documents</Text>
            <Text style={styles.actionSubtitle}>Check verification status</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionIcon}>📊</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Performance</Text>
            <Text style={styles.actionSubtitle}>View detailed analytics</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sosButton}>
          <Text style={styles.sosText}>🚨 Emergency SOS</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Ride Request Modal */}
      <Modal visible={rideModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.rideIconCircle}>
                <Text style={styles.rideIcon}>🏍️</Text>
              </View>
              <Text style={styles.modalTitle}>New Ride Request</Text>
            </View>

            {pendingRide && (
              <View style={styles.rideDetails}>
                <View style={styles.locationBox}>
                  <View style={styles.locRow}>
                    <View style={[styles.locDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.locText} numberOfLines={1}>{pendingRide.pickup.address}</Text>
                  </View>
                  <View style={styles.locLine} />
                  <View style={styles.locRow}>
                    <View style={[styles.locDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.locText} numberOfLines={1}>{pendingRide.dropoff.address}</Text>
                  </View>
                </View>

                <View style={styles.fareContainer}>
                  <Text style={styles.fareLabel}>Estimated Earnings</Text>
                  <Text style={styles.fareAmount}>₹{pendingRide.totalFare}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.declineButton} onPress={declineRide}>
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={acceptRide}>
                <Text style={styles.acceptText}>Accept Ride</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  driverName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 24,
  },
  statusCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statusOnline: {
    backgroundColor: '#10B981',
  },
  statusOffline: {
    backgroundColor: '#9CA3AF',
  },
  statusEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontWeight: 'bold',
    color: '#111827',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
  },
  sosButton: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  sosText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  rideIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  rideDetails: {
    marginBottom: 24,
  },
  locationBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  locText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  locLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 4,
    marginVertical: 4,
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  fareLabel: {
    color: '#6B7280',
    fontSize: 16,
  },
  fareAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  declineText: {
    color: '#4B5563',
    fontWeight: 'bold',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
