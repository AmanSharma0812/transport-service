# 🏗️ QuickRide - Architecture Overview

## 🎯 **System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│  ┌─────────────┐               ┌─────────────┐             │
│  │   RIDER     │               │   DRIVER    │             │
│  │  (Mobile)   │               │  (Mobile)   │             │
│  └──────┬──────┘               └──────┬──────┘             │
│         │                             │                   │
│         │    ┌──────────────┐         │                   │
│         └───►│  REAL-TIME   │◄────────┘                   │
│              │  SOCKET.IO   │                              │
│              └──────┬───────┘                              │
│                     │                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼────┐              ┌─────▼─────┐
    │  BACKEND│              │  DATABASE │
    │ (Node.js│              │ (MongoDB) │
    │ Express)│              │           │
    └────┬────┘              └─────┬─────┘
         │                         │
         │    ┌──────────────┐     │
         └───►│   REDIS      │◄────┘
              │    (Cache)   │
              └───────┬──────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼────┐              ┌─────▼─────┐
    │ EXTERNAL│              │  ADMIN    │
    │ SERVICES│              │ DASHBOARD │
    │         │              │  (React)  │
    │ • Firebase            └───────────┘
    │ • Google Maps
    │ • Razorpay
    │ • Twilio
    └───────────────────────────────┘
```

---

## 📊 **Database Entity Relationship**

```
┌──────────┐       ┌──────────┐       ┌─────────┐
│  USERS   │───1:1─│ DRIVERS  │       │  RIDES  │
│──────────│       │──────────│       │─────────│
│ _id      │       │ _id      │       │ _id     │
│ name     │       │ user     │───1:many│ rideId │
│ email    │       │ vehicle  │       │ rider   │───N:1─┐
│ phone    │       │ docs     │       │ driver  │       │
│ role     │       │ rating   │       │ status  │       │
│ location │       │ isOnline │       │ fare    │       │
└──────────┘       └──────────┘       └─────────┘       │
       │                                              │  ┌──────────┐
       │                ┌──────────┐                  │  │ PAYMENTS │
       └────────────N:1─│ REVIEWS  │                  │  │──────────│
                        │──────────│                  │  │ rideId   │
                        │ ride     │                  │  │ rider    │
                        │ reviewer │                  │  │ driver   │
                        │ rating   │                  │  │ status   │
                        └──────────┘                  │  │ amount   │
                                                       └──────────┘

┌─────────────┐        ┌─────────────┐
│  PROMOCODES │        │  SOSALERTS  │
│─────────────│        │─────────────│
│ code        │        │ ride        │
│ type        │        │ user        │
│ discount    │        │ location    │
│ usageLimit  │        │ status      │
│ usedCount   │        │ triggered   │
└─────────────┘        └─────────────┘
```

---

## 🔄 **Ride Lifecycle Flow**

```
┌─────────┐
│ Request │───────────┐
└────┬────┘           │
     │                ▼
     │         ┌─────────────┐
     │         │  Searching  │
     │         │ (Broadcast  │
     │         │  to drivers)│
     │         └──────┬──────┘
     │                │ Driver accepts
     │                ▼
     │         ┌─────────────┐
     │         │  Accepted   │◄─── Rider notified
     │         └──────┬──────┘
     │                │ Driver arrives
     │                ▼
     │         ┌─────────────┐
     │         │  Arriving   │◄─── Rider notified
     │         └──────┬──────┘
     │                │ Rider boards
     │                ▼
     │         ┌─────────────┐
     │         │  Ongoing    │◄─── Tracking active
     │         └──────┬──────┘
     │                │ Destination reached
     │                ▼
     │         ┌─────────────┐
     │         │ Completed   │◄─── Payment triggered
     │         └──────┬──────┘
     │                │ Rate driver
     │                ▼
     └──────────────▶ Finished
```

---

## 📱 **App Flow Diagrams**

### **Rider App Flow**
```
[Launch App]
     │
     ├── No Account ──▶ Register (Phone + OTP)
     │                    │
     │                    ▼
     │              [Set Location]
     │                    │
     │                    ▼
     │              [Book Ride] ──▶ [Select Vehicle]
     │                    │              │
     │                    ▼              ▼
     │              [Fare Est.]     [Apply Coupon?]
     │                    │              │
     │                    └──────┬───────┘
     │                           ▼
     │              [Confirm Booking] ──▶ [Searching...]
     │                           │              │
     │                           ▼              ▼
     │              [Driver Found]  [Driver Accepted]
     │                           │              │
     │                           ▼              ▼
     │              [Driver Arriving] ──▶ [Start Ride]
     │                           │              │
     │                           ▼              ▼
     │              [Ongoing Ride] ──▶ [Complete Ride]
     │                           │              │
     │                           └──────┬───────┘
     │                                  ▼
     │                    [Pay] & [Rate Driver]
     │                                  │
     ▼                                  ▼
[Next Booking] ◀── [Ride History] ◀── [Invoice]
```

### **Driver App Flow**
```
[Launch App]
     │
     ├── New Driver ──▶ [Upload Documents]
     │                    │
     │                    ▼
     │              [Admin Approval]
     │                    │
     ▼                    ▼
[Login]              [Wait for approval]
     │                    │
     ▼                    ▼
[Go Online] ────┬───▶ [Active] ──┐
   │            │                │
   │     ┌──────▼──────┐         │
   │     │ Receive     │         │
   │     │ Ride        │         │
   │     │ Request     │         │
   │     └──────┬──────┘         │
   │            │                │
   │      ┌─────▼─────┐          │
   │      │ Accept    │          │
   │      │/Reject    │          │
   │      └─────┬─────┘          │
   │            │                 │
   │      ┌─────▼─────┐          │
   │      │ Start     │          │
   │      │ Navigation│          │
   │      └─────┬─────┘          │
   │            │                 │
   │      ┌─────▼─────┐          │
   │      │ Complete  │          │
   │      │ Ride      │          │
   │      └─────┬─────┘          │
   │            │                 │
   │            ▼                 │
   │      [Earn Money] ◄──────────┘
   │
   ▼
[Go Offline]
```

---

## 🔐 **Security Architecture**

```
┌────────────────────────────────────────────┐
│            SECURITY LAYERS                 │
├────────────────────────────────────────────┤
│ 1. HTTPS (SSL/TLS)                         │
│ 2. Helmet.js (Security Headers)            │
│ 3. Rate Limiting (15min / 100 reqs)       │
│ 4. CORS (Whitelisted origins)              │
│ 5. Input Validation & Sanitization         │
│ 6. JWT Authentication                      │
│ 7. Role-Based Authorization                │
│ 8. SQL/NoSQL Injection Prevention          │
│ 9. Secure Password Hashing (bcrypt)        │
│10. File Upload MIME checking               │
└────────────────────────────────────────────┘
```

---

## 📈 **Scalability Design**

```
┌──────────────┐
│   Load       │
│  Balancer    │ (Nginx)
│   (Nginx)    │
└──────┬───────┘
       │
   ┌───▼────┐   ┌───▼────┐   ┌───▼────┐
   │Backend │   │Backend │   │Backend │
   │  Node 1│   │  Node 2│   │  Node 3│
   └───┬────┘   └───┬────┘   └───┬────┘
       │            │            │
       └────────────┼────────────┘
                    │
             ┌──────▼──────┐
             │  MongoDB    │ (Replica Set)
             │  Primary    │
             └──────┬──────┘
                    │
             ┌──────▼──────┐
             │  MongoDB    │ (Secondary)
             │  Secondary  │
             └─────────────┘

             ┌──────▼──────┐
             │   Redis     │ (Cache Layer)
             └─────────────┘
```

---

## 🏗️ **Tech Stack Matrix**

| Component          | Technology              | Purpose                           |
|--------------------|-------------------------|-----------------------------------|
| **Mobile - Rider** | React Native            | Customer-facing app               |
| **Mobile - Driver**| React Native            | Driver-facing app                 |
| **Web Admin**      | React + TypeScript      | Admin dashboard                   |
| **Backend API**    | Node.js + Express       | REST API server                   |
| **Database**       | MongoDB                 | Primary data store               |
| **Cache**          | Redis (optional)        | Session & frequently used data   |
| **Realtime**       | Socket.IO               | Live ride updates                |
| **Auth**           | JWT + Firebase          | User authentication              |
| **Maps**           | Google Maps API         | geocoding, routing, directions  |
| **Payments**       | Razorpay                | Payment gateway                  |
| **SMS/OTP**        | Twilio                  | Send verification codes          |
| **Push**           | Firebase Cloud Messaging| Notifications                    |
| **Deployment**     | Docker                  | Containerization                 |
| **Reverse Proxy**  | Nginx                   | Load balancing & SSL             |
| **Process Mgmt**   | PM2                     | Keep backend alive               |
| **Logging**        | Winston                 | Structured logging               |

---

## 🎨 **UI Component Structure**

```
Admin Dashboard (React)
├── Layout (Sidebar + Header)
├── Pages
│   ├── Dashboard
│   │   ├── Stat Cards (4)
│   │   ├── Charts (2)
│   │   └── Recent Rides Table
│   ├── Users
│   │   └── Data Table (with actions)
│   ├── Drivers
│   │   ├── Stats Grid
│   │   └── Data Table
│   ├── Rides
│   │   └── Data Table
│   ├── Analytics
│   │   ├── Period Selector
│   │   ├── Summary Cards
│   │   ├── Line Chart
│   │   └── Bar Chart
│   ├── PromoCodes
│   │   ├── Create Modal
│   │   └── List Table
│   └── Settings
│       ├── Pricing Form
│       └── Commission Slider
```

---

## 🔄 **Data Flow: Book a Ride**

```
┌──────────┐
│  Rider   │
│   App    │
└────┬─────┘
     │ 1. POST /rider/book-ride
     │    {pickup, dropoff, vehicle}
     ▼
┌──────────────┐
│  Backend API │
│   (Express)  │
└──────┬───────┘
       │ 2. Validate & Calculate fare
       │ 3. Create Ride document
       │ 4. Set status='requested'
       ▼
┌──────────┐
│ MongoDB  │ (Store ride)
└────┬─────┘
       │ 5. Emit via Socket.IO
       │
       ▼
┌──────────────┐
│  Driver App  │ (Mobile)
│   receives   │ ━━━━━━━━━━━━━━┓
│ "newRide"    │               │ Filter by location,
└──────┬───────┘               │ vehicle type, online
       │                       │
       │ 6. Accept/Reject       │
       │                       ┃
       ▼                       ┃
┌──────────────┐              ┃ 7. If accepted:
│ Update Ride  │              ┃    → status='accepted'
│   Status     │              ┃    → Assign driver
└──────┬───────┘              ┃    → Notify rider
       │                       ┃
       │ 8. Emit via Socket.IO ┃
       ▼                       ┃
┌──────────────┐              ┃
│  Rider App   │              ┃
│RideAccepted  │◀─────────────┛
└──────────────┘
       │
       │ Continue flow:
       │ Driver arrives → Start ride → Complete
       ▼
```

---

## 🗂️ **File Naming Conventions**

- **Models:** PascalCase + `.js` (e.g., `User.js`)
- **Controllers:** camelCase + `Controller.js` (e.g., `authController.js`)
- **Routes:** kebab-case + `.js` (e.g., `ride-requests.js`)
- **Components:** PascalCase → `Button.js`
- **Screens:** PascalCase → `HomeScreen.js`
- **Config:** kebab-case → `tailwind.config.js`

---

## 🎯 **API Versioning Strategy**

```
/api/v1/
├── /auth
├── /rider
├── /driver
├── /admin
├── /rides
├── /payment
└── /notifications

/api/v2/ (future)
├── New endpoints with breaking changes
└── Maintain v1 for backward compatibility
```

---

## 📝 **Code Style Guide**

- **Indentation:** 2 spaces
- **Semicolons:** Enabled
- **Quotes:** Single quotes
- **Trailing commas:** Enabled
- **ES6+ features:** Full usage
- **Async/await:** Required over promises
- **Error handling:** Try-catch with logging
- **Comments:** Inline for complex logic only
- **Variable names:** descriptive (no `x`, `y`, `a`, `b`)

---

## 🔍 **Monitoring Points**

| Metric                 | Tool           | Threshold        |
|------------------------|----------------|------------------|
| API Response Time      | Winston + Grafana | < 200ms (p99) |
| Active Rides           | MongoDB + Prometheus | Track count |
| Server Health          | PM2 + Node Exporter | CPU < 80%  |
| Database Connections   | MongoDB Atlas   | < 1000 concurrent |
| Error Rate             | Sentry          | < 0.1%          |
| Payment Success Rate   | Razorpay webhook| > 98%          |

---

This architecture ensures **scalability**, **reliability**, and **maintainability** for a production bike taxi service! 🚀