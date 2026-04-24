# QuickRide API Documentation

**Base URL:** `http://localhost:5000/api` (development)

**Authentication:** Bearer Token (JWT)

---

## 🔐 **Authentication**

### Register Rider
```http
POST /auth/register/rider
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "password": "securePass123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "+919876543210",
    "role": "rider"
  }
}
```

---

### Register Driver
```http
POST /auth/register/driver
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+919876543210",
  "password": "securePass123",
  "vehicle": {
    "type": "bike",
    "make": "Bajaj",
    "model": "Pulsar NS200",
    "registrationNumber": "KA01AB1234"
  },
  "documents": {
    "drivingLicense": {
      "number": "DL123456",
      "frontImage": "https://...",
      "backImage": "https://..."
    },
    "rcBook": {
      "number": "RC123",
      "image": "https://..."
    },
    "insurance": {
      "number": "INS123",
      "image": "https://..."
    }
  }
}
```

---

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePass123"
}
```

---

### Verify OTP (Firebase)
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456",
  "firebaseVerificationId": "..."
}
```

---

### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

---

### Update Location
```http
PUT /auth/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

---

## 🏍️ **Rider Endpoints**

### Get Fare Estimate
```http
GET /rider/estimate-fare?pickupLat=12.9716&pickupLng=77.5946&dropoffLat=12.9352&dropoffLng=77.6245&vehicleType=bike
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "baseFare": 20,
    "distanceFare": 42.4,
    "timeFare": 18,
    "surgeMultiplier": 1,
    "surgeAmount": 0,
    "taxes": 4.004,
    "total": 84.4,
    "distance": 5.3,
    "duration": 18
  }
}
```

---

### Book a Ride
```http
POST /rider/book-ride
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickupLat": 12.9716,
  "pickupLng": 77.5946,
  "pickupAddress": "MG Road, Bangalore",
  "dropoffLat": 12.9352,
  "dropoffLng": 77.6245,
  "dropoffAddress": "Whitefield, Bangalore",
  "vehicleType": "bike",
  "paymentMethod": "cash",
  "couponCode": "FIRST50"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rideId": "QRABC123def",
    "status": "requested",
    "totalFare": 84,
    ...
  }
}
```

---

### Cancel Ride
```http
POST /rider/cancel-ride/:rideId
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "No longer needed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ride cancelled successfully",
  "cancellationFee": 21
}
```

---

### Rate a Ride
```http
POST /rider/rate-ride/:rideId
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Great driver, on time!",
  "categories": {
    "punctuality": 5,
    "behavior": 5,
    "vehicleCondition": 4
  }
}
```

---

### Get Ride History
```http
GET /rider/rides?page=1&limit=20&status=completed
Authorization: Bearer <token>
```

---

## 🛵 **Driver Endpoints**

### Get Dashboard Stats
```http
GET /driver/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "today": { "rides": 4, "earnings": 450 },
      "week": { "rides": 28 },
      "totalLifetime": { "rides": 342, "earnings": 28500 }
    },
    "status": {
      "isOnline": false,
      "currentRide": null
    }
  }
}
```

---

### Toggle Online Status
```http
PUT /driver/toggle-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "isOnline": true
}
```

---

### Accept Ride Request
```http
POST /driver/accept-ride/:rideId
Authorization: Bearer <token>
```

---

### Start Ride
```http
PUT /driver/start-ride/:rideId
Authorization: Bearer <token>
Content-Type: application/json

{
  "startLat": 12.9716,
  "startLng": 77.5946
}
```

---

### Complete Ride
```http
PUT /driver/complete-ride/:rideId
Authorization: Bearer <token>
Content-Type: application/json

{
  "dropoffLat": 12.9352,
  "dropoffLng": 77.6245,
  "distance": 12.5,
  "duration": 35
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ride": { ... },
    "payment": {
      "paymentId": "PAY123",
      "amount": 145,
      "method": "cash"
    }
  }
}
```

---

### Get Earnings
```http
GET /driver/earnings?period=weekly
Authorization: Bearer <token>
```

---

## 👨‍💼 **Admin Endpoints**

> All admin endpoints require `role: admin` in JWT

### Dashboard Overview
```http
GET /admin/dashboard
Authorization: Bearer <token>
```

---

### List Users
```http
GET /admin/users?page=1&limit=20&role=rider
Authorization: Bearer <token>
```

---

### Block/Unblock User
```http
PUT /admin/users/:userId/block
Authorization: Bearer <token>
Content-Type: application/json

{
  "isBlocked": true
}
```

---

### List Drivers
```http
GET /admin/drivers?isApproved=false&isOnline=true
Authorization: Bearer <token>
```

---

### Approve Driver
```http
PUT /admin/drivers/:driverId/approval
Authorization: Bearer <token>
Content-Type: application/json

{
  "isApproved": true
}
```

---

### Update Pricing
```http
PUT /admin/pricing
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleType": "bike",
  "baseFare": 25,
  "perKmRate": 9
}
```

---

### Create Promo Code
```http
POST /admin/promo-codes
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "WELCOME50",
  "type": "percentage",
  "discount": 50,
  "validFrom": "2024-01-01",
  "validUntil": "2024-12-31",
  "usageLimit": 1000
}
```

---

### SOS Alerts
```http
GET /admin/sos-alerts?status=active
Authorization: Bearer <token>
```

---

## 💳 **Payment Endpoints**

### Create Order (Razorpay)
```http
POST /payment/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "rideId": "QRABC123def",
  "amount": 145
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_9A33XWuYgAwBt5",
    "amount": 14500,
    "currency": "INR",
    "key": "rzp_test_xxx"
  }
}
```

---

### Verify Payment
```http
POST /payment/verify
Content-Type: application/json

{
  "orderId": "order_9A33XWuYgAwBt5",
  "paymentId": "pay_9A33XWuYgAwBt5",
  "signature": "hmac_sha256_signature",
  "paymentId": "pay_123"
}
```

---

### Cash Payment Confirm
```http
POST /payment/cash-confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "rideId": "QRABC123def"
}
```

---

### Payment History
```http
GET /payment/history?page=1&limit=20
Authorization: Bearer <token>
```

---

## 🔔 **Notification Endpoints**

### Send Notification
```http
POST /notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "title": "Ride Request",
  "body": "You have a new ride request",
  "data": {
    "type": "ride_request",
    "rideId": "QR123",
    "action": "OPEN_RIDE"
  }
}
```

---

### Get User Notifications
```http
GET /notifications?page=1&limit=20&unreadOnly=false
Authorization: Bearer <token>
```

---

### Mark as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

---

## 🔄 **Socket.IO Events**

### Client Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

### Join Rooms
```javascript
// Rider joins rider room
socket.emit('join', { userId: '...', role: 'rider' });

// Driver joins driver room
socket.emit('join', { userId: '...', role: 'driver' });
```

### Rider → Book Ride
```javascript
socket.emit('requestRide', {
  pickup: { lat, lng, address },
  dropoff: { lat, lng, address },
  vehicleType: 'bike',
  totalFare: 84
});
```

### Driver → Accept Ride
```javascript
socket.emit('acceptRide', {
  rideId: 'QR123',
  driverId: 'driver_123'
});
```

### Update Location
```javascript
socket.emit('updateLocation', {
  latitude: 12.9716,
  longitude: 77.5946,
  timestamp: Date.now()
});
```

### Events to Listen

**Rider listens:**
- `rideAccepted` - Driver accepted ride
- `driverArriving` - Driver is arriving
- `rideStarted` - Ride started
- `rideCompleted` - Ride completed

**Driver listens:**
- `newRideRequest` - New ride request available

---

## 📱 **Webhook Events**

For payment gateway callbacks and external integrations:

### Razorpay Webhook
**URL:** `/api/webhooks/razorpay`

**Events:**
- `payment.captured`
- `payment.failed`
- `refund.processed`

---

## 🛠 **Error Codes**

| Code | Description |
|------|-------------|
| 400  | Bad request - validation error |
| 401  | Unauthorized - invalid/missing token |
| 403  | Forbidden - insufficient permissions |
| 404  | Not found - resource doesn't exist |
| 409  | Conflict - duplicate entry |
| 500  | Server error |

**Error Response Format:**
```json
{
  "success": false,
  "error": "Invalid phone number format",
  "code": "VALIDATION_ERROR"
}
```

---

## 🧪 **Testing with cURL**

### Register Rider
```bash
curl -X POST http://localhost:5000/api/auth/register/rider \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "password": "password123"
  }'
```

### Book a Ride
```bash
curl -X POST http://localhost:5000/api/rider/book-ride \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupLat": 12.9716,
    "pickupLng": 77.5946,
    "pickupAddress": "MG Road",
    "dropoffLat": 12.9352,
    "dropoffLng": 77.6245,
    "dropoffAddress": "Whitefield",
    "vehicleType": "bike",
    "paymentMethod": "cash"
  }'
```

---

**Note:** This API documentation is for development purposes. In production, use environment-specific endpoints and enable HTTPS.