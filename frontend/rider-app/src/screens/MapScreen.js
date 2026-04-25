import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { riderAPI } from '../services/api';
import { io } from 'socket.io-client';

const { width, height } = Dimensions.get('window');

// Generate intermediate points along path for smooth animation
const generatePath = (start, end, segments = 50) => {
  const path = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    path.push({
      latitude: start.latitude + (end.latitude - start.latitude) * t,
      longitude: start.longitude + (end.longitude - start.longitude) * t,
    });
  }
  return path;
};

export default function MapScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { pickup, dropoff, vehicleType, estimatedFare, distance } = route.params || {};

  const [status, setStatus] = useState('searching');
  const [driver, setDriver] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [rideId, setRideId] = useState(null);
  const animationRef = useRef(null);
  const socketRef = useRef(null);

  // Mock coordinates
  const pickupCoords = { latitude: 12.9716, longitude: 77.5946 };
  const dropoffCoords = { latitude: 12.9352, longitude: 77.6245 };
  const driverStartCoords = { latitude: 12.9850, longitude: 77.6050 };

  // Connect to socket for real-time updates
  useEffect(() => {
    socketRef.current = io('http://192.168.1.8:5000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      // Join user room
      socketRef.current.emit('join', { userId: 'rider-123', role: 'rider' });
    });

    socketRef.current.on('rideAccepted', (data) => {
      console.log('Ride accepted:', data);
      setStatus('accepted');
      setDriver({
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        vehicle: 'KA 01 AB 1234',
        rating: 4.8,
      });
      setDriverLocation(driverStartCoords);
    });

    socketRef.current.on('rideStatusUpdate', (data) => {
      console.log('Ride status update:', data);
      if (data.status === 'arriving') {
        setStatus('arriving');
      } else if (data.status === 'ongoing') {
        setStatus('ongoing');
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Generate route path when status changes
  useEffect(() => {
    if (status === 'accepted' || status === 'arriving') {
      const path = generatePath(driverStartCoords, pickupCoords, 100);
      setRoutePath(path);
      setCurrentPathIndex(0);
    } else if (status === 'ongoing') {
      const path = generatePath(pickupCoords, dropoffCoords, 100);
      setRoutePath(path);
      setCurrentPathIndex(0);
    }
  }, [status]);

  // Animate driver along path
  useEffect(() => {
    if (status === 'accepted' || status === 'arriving' || status === 'ongoing') {
      animationRef.current = setInterval(() => {
        setCurrentPathIndex((prev) => {
          if (prev >= routePath.length - 1) {
            clearInterval(animationRef.current);
            return prev;
          }
          const newIndex = prev + 1;
          setDriverLocation(routePath[newIndex]);
          return newIndex;
        });
      }, 50);

      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [status, routePath]);

  // Book ride when component mounts
  useEffect(() => {
    bookRide();
  }, []);

  const bookRide = async () => {
    try {
      const response = await riderAPI.bookRide({
        pickupLat: pickupCoords.latitude,
        pickupLng: pickupCoords.longitude,
        pickupAddress: pickup,
        dropoffLat: dropoffCoords.latitude,
        dropoffLng: dropoffCoords.longitude,
        dropoffAddress: dropoff,
        vehicleType,
        paymentMethod: 'cash',
      });

      setRideId(response.data.data.rideId);
      console.log('Ride booked:', response.data.data);
      // Status remains 'searching' until driver accepts via socket
    } catch (error) {
      console.error('Failed to book ride:', error);
      Alert.alert('Error', 'Failed to book ride. Please try again.');
      navigation.goBack();
    }
  };

  // Simulate status changes for demo (remove when real backend is connected)
  useEffect(() => {
    // Demo: simulate driver accepting after 3 seconds
    if (status === 'searching') {
      const timer = setTimeout(() => {
        setStatus('accepted');
        setDriver({
          name: 'Rajesh Kumar',
          phone: '+91 9876543210',
          vehicle: 'KA 01 AB 1234',
          rating: 4.8,
        });
        setDriverLocation(driverStartCoords);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Handle button actions
  const handleDriverArriving = () => {
    // In real app, this would be triggered by driver action
    setStatus('arriving');
  };

  const handleStartRide = () => {
    setStatus('ongoing');
  };

  const handleCompleteRide = () => {
    setStatus('completed');
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          ...pickupCoords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {/* Pickup marker */}
        <Marker
          coordinate={pickupCoords}
          title="Pickup"
          description={pickup}
          pinColor="green"
        />

        {/* Dropoff marker */}
        <Marker
          coordinate={dropoffCoords}
          title="Dropoff"
          description={dropoff}
          pinColor="red"
        />

        {/* Route polyline */}
        <Polyline
          coordinates={[pickupCoords, dropoffCoords]}
          strokeColor="#3B82F6"
          strokeWidth={4}
          strokePattern={[1, 3]}
        />

        {/* Animated driver marker */}
        {driverLocation && status !== 'searching' && (
          <Marker
            coordinate={driverLocation}
            title={driver?.name}
            description={driver?.vehicle}
          >
            <View style={styles.driverMarker}>
              <Text style={styles.driverIcon}>
                {vehicleType === 'bike' ? '🏍️' : vehicleType === 'auto' ? '🛻' : '🚗'}
              </Text>
            </View>
          </Marker>
        )}

        {/* Progress circle */}
        {status === 'arriving' && driverLocation && (
          <Circle
            center={pickupCoords}
            radius={20}
            strokeColor="#10B981"
            fillColor="rgba(16, 185, 129, 0.2)"
          />
        )}
      </MapView>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusInner}>
          <View>
            <Text style={styles.statusTitle}>
              {status === 'searching' ? 'Finding driver...' : 'Driver Found'}
            </Text>
            {driver && (
              <Text style={styles.statusSubtitle}>
                {driver.name} • {driver.rating}★
              </Text>
            )}
          </View>

          {status === 'searching' ? (
            <ActivityIndicator size="large" color="#3B82F6" />
          ) : (
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress steps */}
        <View style={styles.progressRow}>
          <View style={[styles.step, status !== 'none' ? styles.stepActive : styles.stepInactive]}>
            <Text style={styles.stepText}>✓</Text>
          </View>
          <View style={[styles.stepLine, ['accepted', 'arriving', 'ongoing', 'completed'].includes(status) ? styles.stepLineActive : styles.stepLineInactive]} />
          <View style={[styles.step, ['arriving', 'ongoing', 'completed'].includes(status) ? styles.stepActive : styles.stepInactive]}>
            <Text style={styles.stepText}>📍</Text>
          </View>
          <View style={[styles.stepLine, ['ongoing', 'completed'].includes(status) ? styles.stepLineActive : styles.stepLineInactive]} />
          <View style={[styles.step, status === 'completed' ? styles.stepActive : styles.stepInactive]}>
            <Text style={styles.stepText}>🏁</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {status === 'searching' && (
          <View style={styles.searchingContainer}>
            <Text style={styles.searchingTitle}>Searching for nearby {vehicleType}s</Text>
            <Text style={styles.searchingSubtitle}>Finding the best driver for you...</Text>
            <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
          </View>
        )}

        {status === 'accepted' && driver && (
          <View>
            <View style={styles.driverInfoRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverIconSmall}>
                  {vehicleType === 'bike' ? '🏍️' : vehicleType === 'auto' ? '🛻' : '🚗'}
                </Text>
              </View>
              <View style={styles.driverDetail}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.vehicleDetail}>{vehicleType.toUpperCase()} • {driver.vehicle}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{driver.rating}★</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Text style={styles.fareMain}>₹{Math.round(estimatedFare)}</Text>
              <TouchableOpacity style={styles.actionButton} onPress={handleDriverArriving}>
                <Text style={styles.actionButtonText}>Driver Arriving</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {status === 'arriving' && (
          <View>
            <Text style={styles.arrivingTitle}>Driver has arrived at pickup</Text>
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>Your driver is waiting at the pickup location</Text>
            </View>
            <TouchableOpacity style={styles.startButton} onPress={handleStartRide}>
              <Text style={styles.startButtonText}>Start Ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'ongoing' && (
          <View>
            <Text style={styles.arrivingTitle}>Ride in progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Fare</Text>
                <Text style={styles.statValue}>₹{Math.round(estimatedFare)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.completeButton} onPress={handleCompleteRide}>
              <Text style={styles.startButtonText}>Complete Ride</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'completed' && (
          <View>
            <Text style={styles.completedTitle}>Ride Completed!</Text>
            <TouchableOpacity style={styles.homeButton} onPress={() => navigation.popToTop()}>
              <Text style={styles.homeButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  driverMarker: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverIcon: {
    fontSize: 20,
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTitle: {
    fontWeight: 'bold',
    color: '#111827',
    fontSize: 16,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#4B5563',
  },
  callButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: '#10B981',
  },
  stepInactive: {
    backgroundColor: '#D1D5DB',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  stepLine: {
    flex: 1,
    height: 4,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  stepLineInactive: {
    backgroundColor: '#D1D5DB',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  searchingContainer: {
    alignItems: 'center',
  },
  searchingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  searchingSubtitle: {
    color: '#6B7280',
    textAlign: 'center',
  },
  loader: {
    marginTop: 24,
  },
  driverInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  driverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  driverIconSmall: {
    fontSize: 24,
  },
  driverDetail: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  vehicleDetail: {
    color: '#6B7280',
    marginTop: 4,
  },
  ratingBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingText: {
    color: '#065F46',
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fareMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  arrivingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  alertBox: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  alertText: {
    color: '#92400E',
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 24,
  },
  homeButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});