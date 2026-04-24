require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Driver = require('./models/Driver');
const Ride = require('./models/Ride');
const Payment = require('./models/Payment');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/quickride';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Driver.deleteMany({});
    await Ride.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'QuickRide Admin',
      email: 'admin@quickride.com',
      phone: '+919999999999',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      isVerified: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.5946, 12.9716]
      }
    });
    console.log('Created admin user');

    // Create sample riders
    const rider1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+919876543210',
      password: await bcrypt.hash('password123', 10),
      role: 'rider',
      isVerified: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.6000, 12.9700]
      },
      totalRides: 5,
      totalSpent: 650
    });

    const rider2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+919876543211',
      password: await bcrypt.hash('password123', 10),
      role: 'rider',
      isVerified: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.5900, 12.9750]
      },
      totalRides: 3,
      totalSpent: 320
    });

    console.log('Created sample riders');

    // Create sample drivers (separate users with driver role)
    const driverUser1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+919876543220',
      password: await bcrypt.hash('password123', 10),
      role: 'driver',
      isVerified: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.6000, 12.9700]
      },
      totalRides: 342,
      totalEarnings: 28500
    });

    const driverUser2 = await User.create({
      name: 'Suresh Patel',
      email: 'suresh@example.com',
      phone: '+919876543221',
      password: await bcrypt.hash('password123', 10),
      role: 'driver',
      isVerified: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.5900, 12.9750]
      },
      totalRides: 156,
      totalEarnings: 12800
    });

    console.log('Created sample driver users');

    // Create sample drivers
    const driver1 = await Driver.create({
      user: driverUser1._id,
      vehicle: {
        type: 'bike',
        make: 'Bajaj',
        model: 'Pulsar NS200',
        year: 2022,
        color: 'Black',
        registrationNumber: 'KA01AB1234',
        vehicleImage: 'https://example.com/bike.jpg'
      },
      documents: {
        drivingLicense: {
          number: 'DL123456',
          frontImage: 'https://example.com/dl_front.jpg',
          verified: true
        },
        rcBook: {
          number: 'RC123',
          image: 'https://example.com/rc.jpg',
          verified: true
        },
        insurance: {
          number: 'INS456',
          image: 'https://example.com/insurance.jpg',
          verified: true
        }
      },
      isActive: true,
      isApproved: true,
      isOnline: true,
      averageRating: 4.8,
      totalRides: 342,
      totalEarnings: 28500,
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+919999999998',
        relation: 'Family'
      },
      bankAccount: {
        accountNumber: '1234567890',
        ifsc: 'SBIN0001234',
        accountHolderName: 'Rajesh Kumar'
      }
    });

    const driver2 = await Driver.create({
      user: driverUser2._id,
      vehicle: {
        type: 'auto',
        make: 'Bajaj',
        model: 'RE Maxima',
        year: 2021,
        color: 'Yellow',
        registrationNumber: 'KA02CD5678',
        vehicleImage: 'https://example.com/auto.jpg'
      },
      documents: {
        drivingLicense: {
          number: 'DL789012',
          frontImage: 'https://example.com/dl_front2.jpg',
          verified: true
        },
        permit: {
          number: 'PERMIT123',
          image: 'https://example.com/permit.jpg',
          verified: true
        }
      },
      isActive: true,
      isApproved: true,
      isOnline: false,
      averageRating: 4.5,
      totalRides: 156,
      totalEarnings: 12800
    });

    console.log('Created sample drivers');

    // Create sample rides
    const ride1 = await Ride.create({
      rideId: 'QR' + Date.now(),
      rider: rider1._id,
      driver: driver1._id,
      vehicleType: 'bike',
      pickup: {
        address: 'MG Road, Bangalore',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        }
      },
      dropoff: {
        address: 'Whitefield, Bangalore',
        location: {
          type: 'Point',
          coordinates: [77.6245, 12.9352]
        }
      },
      distance: 12.5,
      duration: 35,
      baseFare: 20,
      distanceFare: 100,
      timeFare: 35,
      surgeMultiplier: 1,
      estimatedFare: 155,
      totalFare: 155,
      status: 'completed',
      payment: {
        method: 'cash',
        status: 'completed'
      },
      completedAt: new Date(Date.now() - 86400000), // 1 day ago
      route: [
        {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          timestamp: new Date()
        },
        {
          type: 'Point',
          coordinates: [77.6245, 12.9352],
          timestamp: new Date()
        }
      ]
    });

    const ride2 = await Ride.create({
      rideId: 'QR' + (Date.now() - 1000),
      rider: rider2._id,
      driver: driver2._id,
      vehicleType: 'auto',
      pickup: {
        address: 'Koramangala, Bangalore',
        location: {
          type: 'Point',
          coordinates: [77.6098, 12.9279]
        }
      },
      dropoff: {
        address: 'Indiranagar, Bangalore',
        location: {
          type: 'Point',
          coordinates: [77.6089, 12.9716]
        }
      },
      distance: 8.2,
      duration: 28,
      baseFare: 30,
      distanceFare: 98.4,
      timeFare: 42,
      estimatedFare: 170.4,
      totalFare: 170,
      status: 'completed',
      payment: {
        method: 'upi',
        status: 'completed',
        paidAt: new Date(Date.now() - 172800000) // 2 days ago
      },
      completedAt: new Date(Date.now() - 172800000)
    });

    console.log('Created sample rides');

    // Create payment records
    await Payment.create({
      paymentId: 'PAY' + Date.now(),
      ride: ride1._id,
      rider: rider1._id,
      driver: driver1._id,
      amount: ride1.totalFare,
      method: 'cash',
      gateway: 'manual',
      status: 'completed',
      paidAt: new Date(Date.now() - 86400000),
      driverEarnings: ride1.totalFare * 0.85,
      commission: ride1.totalFare * 0.15
    });

    await Payment.create({
      paymentId: 'PAY' + (Date.now() - 1000),
      ride: ride2._id,
      rider: rider2._id,
      driver: driver2._id,
      amount: ride2.totalFare,
      method: 'upi',
      gateway: 'razorpay',
      status: 'completed',
      paidAt: new Date(Date.now() - 172800000),
      driverEarnings: ride2.totalFare * 0.85,
      commission: ride2.totalFare * 0.15
    });

    console.log('Created payment records');

    // Output summary
    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('\nAccounts created:');
    console.log(`Admin:    admin@quickride.com / admin123`);
    console.log(`Rider 1:  rahul@example.com / password123`);
    console.log(`Rider 2:  priya@example.com / password123`);
    console.log(`Driver 1: rajesh@example.com / password123`);
    console.log(`Driver 2: suresh@example.com / password123`);
    console.log('\nSample data includes:');
    console.log('- 2 riders with profiles');
    console.log('- 2 drivers with vehicles');
    console.log('- 2 completed rides');
    console.log('- 2 payment records');
    console.log('\n========================================\n');

    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();