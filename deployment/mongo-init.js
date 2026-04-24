// MongoDB initialization script
// This runs when the MongoDB container starts (if database is empty)

db = db.getSiblingDB('quickride');

// Create admin user if not exists
db.createUser({
  user: 'admin',
  pwd: 'admin123',
  roles: [{ role: 'readWrite', db: 'quickride' }]
});

// Create indexes for better performance
// Users
db.users.createIndex({ "phone": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "firebaseUid": 1 }, { sparse: true });
db.users.createIndex({ "currentLocation": "2dsphere" });

// Rides
db.rides.createIndex({ "rideId": 1 }, { unique: true });
db.rides.createIndex({ "rider": 1, "createdAt": -1 });
db.rides.createIndex({ "driver": 1, "createdAt": -1 });
db.rides.createIndex({ "status": 1 });
db.rides.createIndex({ "pickup.location": "2dsphere" });
db.rides.createIndex({ "dropoff.location": "2dsphere" });

// Payments
db.payments.createIndex({ "paymentId": 1 }, { unique: true });
db.payments.createIndex({ "rider": 1 });
db.payments.createIndex({ "driver": 1 });
db.payments.createIndex({ "status": 1 });
db.payments.createIndex({ "createdAt": -1 });

// SOS Alerts
db.sosalerts.createIndex({ "status": 1, "createdAt": -1 });
db.sosalerts.createIndex({ "user": 1 });
db.sosalerts.createIndex({ "location": "2dsphere" });

// Promo Codes
db.promocodes.createIndex({ "code": 1 }, { unique: true });
db.promocodes.createIndex({ "isActive": 1, "validUntil": 1 });

print('MongoDB initialization complete!');