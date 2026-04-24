# QuickRide - Complete Full-Stack Bike Taxi Transport Service

A comprehensive full-stack application similar to Rapido/Ola for bike, auto, and cab booking services.

---

## 📱 **Project Structure**

```
quickride/
├── backend/                   # Node.js + Express Backend
│   ├── controllers/           # Route controllers
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   ├── middleware/           # Auth, validation, error handling
│   ├── utils/                # Logger, helpers
│   ├── config/               # Database config
│   ├── server.js             # Main entry point
│   └── package.json
│
├── frontend/                 # Mobile Applications (React Native)
│   ├── rider-app/           # Rider mobile application
│   │   ├── src/
│   │   │   ├── screens/    # App screens (Home, Map, Profile, etc.)
│   │   │   ├── components/ # Reusable UI components
│   │   │   └── services/   # API service layer
│   │   ├── App.js
│   │   └── package.json
│   │
│   └── driver-app/          # Driver mobile application
│       ├── src/
│       │   ├── screens/    # Driver-specific screens
│       │   ├── components/
│       │   └── services/
│       ├── App.js
│       └── package.json
│
├── admin-dashboard/         # Web Admin Panel (React)
│   ├── src/
│   │   ├── components/     # Layout, navigation
│   │   ├── pages/          # Dashboard, Users, Rides, etc.
│   │   ├── services/       # API integration
│   │   └── store/          # State management (Zustand)
│   ├── package.json
│   └── vite.config.ts
│
├── deployment/              # Deployment configurations
│   ├── docker-compose.yml   # Docker orchestration
│   ├── Dockerfile.backend   # Backend Dockerfile
│   └── nginx.conf           # Nginx configuration
│
└── docs/                    # Documentation
    ├── API.md              # Endpoint references
    └── DEPLOYMENT.md       # Deployment guide
```

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js ≥ 16.x
- MongoDB ≥ 4.4
- Redis (optional, for caching)
- Firebase project (for OTP & notifications)
- Google Maps API key

### **1. Backend Setup**

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configurations
# - MONGODB_URI (mongodb://localhost:27017/quickride)
# - JWT_SECRET (generate a secure key)
# - FIREBASE_CREDENTIALS
# - GOOGLE_MAPS_API_KEY
# - RAZORPAY_KEYS

# Start the server (development)
npm run dev

# Or production
npm start
```

**Server runs on:** http://localhost:5000

---

### **2. Admin Dashboard (React)**

```bash
cd admin-dashboard
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
```

**Dashboard runs on:** http://localhost:3000

---

### **3. Mobile Apps (React Native)**

**Rider App:**
```bash
cd frontend/rider-app
npm install
npx react-native run-android   # Android
npx react-native run-ios       # iOS
```

**Driver App:**
```bash
cd frontend/driver-app
npm install
npx react-native run-android
```

---

## 🗄️ **Database Schema**

### **Collections**

1. **users** - Base user data for both riders and drivers
2. **drivers** - Extended profile, documents, ratings
3. **rides** - Ride details, status, tracking
4. **payments** - Payment transactions
5. **reviews** - Ratings and reviews
6. **promocodes** - Promo and referral codes
7. **sosalerts** - Emergency alerts
8. **notifications** - Push notification history

---

## 🔑 **Authentication Flow**

### **Rider Registration/OTP Flow**
```
1. User enters phone number
2. Firebase sends OTP via SMS
3. User enters OTP → Verify via Firebase Auth
4. Create user with rider role
5. Return JWT token
```

### **Driver Registration Flow**
```
1. Driver enters personal details
2. Upload documents (DL, RC, Insurance, Permit)
3. Documents marked as unverified
4. Admin reviews and approves
5. Driver can go online
```

---

## 🚕 **Ride Booking Flow**

```
1. Rider enters pickup & dropoff → Get fare estimate
2. Select vehicle type (Bike/Auto/Cab)
3. Apply promo code (optional)
4. Choose payment method
5. Confirm booking → Ride created with "requested" status
6. Real-time matching with nearby drivers via Socket.IO
7. Driver accepts → Rider notified
8. Driver arrives → Rider notified
9. Ride starts → Tracking begins
10. Ride completes → Payment triggered
11. Rate & review
```

---

## 💰 **Pricing Model**

### **Base Fare Structure**
| Vehicle | Base Fare (₹) | Per Km (₹) | Per Min (₹) |
|---------|---------------|------------|-------------|
| Bike    | 20            | 8          | 1           |
| Auto    | 30            | 12         | 1.5         |
| Cab     | 50            | 18         | 2.5         |

### **Formula**
```
Total Fare = (Base Fare + Distance×Rate + Time×Rate) × Surge Multiplier + Taxes - Coupon
```

**Surge Pricing:** Activated when active rides > threshold (30-50)

---

## 🛡️ **Safety Features**

1. **SOS Button** - Triggers emergency alert to admin & emergency contacts
2. **Real-time Location Sharing** - Live tracking for both rider & driver
3. **Ride Details** - Driver info, vehicle number shared with rider
4. **Audio/Voice SOS** - (Optional) Trigger via voice command
5. **Safe Route Suggestions**

---

## 📲 **Real-time Features (Socket.IO)**

- **Driver availability** broadcast
- **Ride request** push to nearby drivers
- **Ride status** updates (accepted, arriving, ongoing, completed)
- **Location tracking** during active rides
- **SOS alerts** immediate dispatch

---

## 🔔 **Push Notifications (Firebase Cloud Messaging)**

### **Notification Types**
- Ride request received (Driver)
- Ride accepted (Rider)
- Driver arrived
- Ride started/completed
- Payment due
- SOS alerts
- Promotional messages

---

## 💳 **Payment Integration**

### **Supported Methods**
1. **Cash** - Collected at end of ride
2. **UPI** - QR-based payment
3. **Wallet** - In-app wallet (future)
4. **Razorpay/Stripe** - Card/Netbanking

### **Payment Flow**
1. Ride completed → Payment record created
2. For digital payments → Generate Razorpay order
3. Payment verified → Mark as completed
4. Split: 85% to driver, 15% platform commission

---

## 📈 **Admin Features**

### **Dashboard Overview**
- Total users & drivers
- Active rides
- Daily/weekly/monthly earnings
- Charts & graphs

### **User Management**
- Block/unblock users
- View ride history
- Manage profiles

### **Driver Management**
- Approve/reject documents
- View driver stats
- Enable/disable driver accounts

### **Ride Management**
- View all rides
- Filter by status/date
- Cancel/refund handling

### **Pricing Control**
- Set base fares dynamically
- Adjust surge thresholds
- Commission rates

### **Promo Code Manager**
- Create promo/referral codes
- Set usage limits
- Track redemption

### **SOS Monitoring**
- Live SOS alert feed
- Geolocation on map
- Escalate to authorities

---

## 🔧 **Environment Variables**

### **Backend (.env)**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/quickride
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Firebase
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY=xxx

# Maps & Payments
GOOGLE_MAPS_API_KEY=xxx
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx

# SMS
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=xxx
```

---

## 🐳 **Deployment with Docker**

```bash
cd deployment
docker-compose up -d
```

This starts:
- MongoDB container
- Backend API container
- Nginx reverse proxy

---

## 📦 **API Endpoint Summary**

### **Auth**
- `POST /api/auth/register/rider` - Register rider
- `POST /api/auth/register/driver` - Register driver
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get profile

### **Rider**
- `GET /api/rider/estimate-fare` - Fare estimate
- `POST /api/rider/book-ride` - Book ride
- `POST /api/rider/cancel-ride/:id` - Cancel
- `GET /api/rider/rides` - Ride history
- `POST /api/rider/rate-ride/:id` - Rate
- `POST /api/rider/sos` - SOS alert

### **Driver**
- `GET /api/driver/dashboard` - Stats
- `PUT /api/driver/toggle-status` - Online/offline
- `POST /api/driver/accept-ride/:id` - Accept
- `PUT /api/driver/start-ride/:id` - Start
- `PUT /api/driver/complete-ride/:id` - Complete
- `GET /api/driver/earnings` - Earnings breakdown

### **Payment**
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/cash-confirm` - Confirm cash

### **Admin**
- `GET /api/admin/dashboard` - Analytics
- `GET /api/admin/users` - List users
- `GET /api/admin/drivers` - List drivers
- `PUT /api/admin/approval` - Approve driver
- `PUT /api/admin/pricing` - Update fares

---

## 🧪 **Testing**

```bash
# Backend unit tests
cd backend
npm test

# E2E testing with Jest & Supertest
npm run test:e2e
```

---

## 📊 **Monitoring & Logging**

- **Winston** logger with daily rotation
- **Health check**: `/health` endpoint
- **Error tracking**: Sentry integration (optional)
- **Performance monitoring**: New Relic (optional)

---

## 🔄 **CI/CD Pipeline**

GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. **Push to main** → Run tests
2. **Build Docker images**
3. **Deploy to staging**
4. **Run integration tests**
5. **Promote to production**

---

## 🐛 **Troubleshooting**

### **Common Issues**

1. **MongoDB connection refused**
   ```bash
   # Start MongoDB service
   sudo systemctl start mongod
   ```

2. **Firebase OTP not working**
   - Verify Firebase project credentials
   - Check phone number format (+91...)

3. **Socket.IO connection errors**
   - Ensure CORS configured correctly
   - Check firewall for port 5000

4. **Google Maps not loading**
   - Validate API key
   - Enable Maps JavaScript API in GCP

---

## 🔐 **Security Notes**

- Never commit `.env` files
- Use HTTPS in production
- Sanitize user inputs
- Implement rate limiting
- Store JWT in HttpOnly cookies (or secure storage)
- Enable helmet.js security headers

---

## 📄 **License**

MIT License - See LICENSE file for details.

---

## 🙋 **Support**

For issues, contact: **support@quickride.com**

---

> **Note:** This is a production-ready application skeleton. For production deployment, ensure proper security hardening, load balancing, and monitoring are in place.