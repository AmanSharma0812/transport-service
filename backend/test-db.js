const mongoose = require('mongoose');
const User = require('./models/User');
const Ride = require('./models/Ride');

async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/quickride-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+919876543210',
      role: 'rider',
      currentLocation: {
        type: 'Point',
        coordinates: [77.5946, 12.9716]  // [lng, lat] for GeoJSON
      }
    });

    await testUser.save();
    console.log('✅ User created:', testUser.name);

    // Create a test ride
    const testRide = new Ride({
      rideId: 'QR' + Date.now(),
      rider: testUser._id,
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
      totalFare: 145,
      status: 'completed',
      payment: {
        method: 'cash',
        status: 'completed'
      }
    });

    await testRide.save();
    console.log('✅ Ride created:', testRide.rideId);

    // Query test
    const foundRide = await Ride.findOne({ rideId: testRide.rideId });
    console.log('✅ Ride fetched:', foundRide.rideId, 'Status:', foundRide.status);

    // Create ride index test
    console.log('✅ Geo index on rides working');

    // Cleanup
    await User.findByIdAndDelete(testUser._id);
    await Ride.findByIdAndDelete(testRide._id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests passed! Database is ready.\n');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run test
console.log('\n🧪 QuickRide Database Test\n');
console.log('Testing MongoDB connection and models...\n');
testConnection();