require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const riderRoutes = require('./routes/rider');
const driverRoutes = require('./routes/driver');
const adminRoutes = require('./routes/admin');
const rideRoutes = require('./routes/ride');
const paymentRoutes = require('./routes/payment');
const notificationRoutes = require('./routes/notification');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authenticate, authorize } = require('./middleware/auth');

const app = express();
const httpServer = createServer(app);
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3001',
  '*' // Allow all for development/mobile testing
];

const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST']
  }
});

// Attach io to app for access in controllers (avoids circular dependency)
app.set('io', io);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rider', authenticate, authorize('rider'), riderRoutes);
app.use('/api/driver', authenticate, authorize('driver'), driverRoutes);
app.use('/api/admin', authenticate, authorize('admin'), adminRoutes);
app.use('/api/rides', authenticate, rideRoutes);
app.use('/api/payment', authenticate, paymentRoutes);
app.use('/api/notifications', authenticate, notificationRoutes);

// Socket.IO for real-time updates
io.use((socket, next) => {
  // Authentication middleware for socket
  const token = socket.handshake.auth.token;
  if (token) {
    // Verify JWT token here
    // For now, accept all connections
    next();
  } else {
    next(new Error('Authentication required'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    const { userId, role } = data;
    socket.join(role);
    socket.join(userId);
    console.log(`User ${userId} joined room ${role}`);
  });

  socket.on('requestRide', async (data) => {
    // Broadcast ride request to nearby drivers
    socket.to('driver').emit('newRideRequest', data);
  });

  socket.on('acceptRide', async (data) => {
    socket.to(data.riderId).emit('rideAccepted', data);
  });

  socket.on('updateLocation', (data) => {
    socket.broadcast.emit('locationUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quickride', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
});

startServer();

module.exports = { app, io };