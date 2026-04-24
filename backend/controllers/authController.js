const User = require('../models/User');
const Driver = require('../models/Driver');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register rider
// @route   POST /api/auth/register/rider
const registerRider = async (req, res) => {
  try {
    const { name, email, phone, password, firebaseUid } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or phone already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      firebaseUid,
      role: 'rider',
      currentLocation: {
        type: 'Point',
        coordinates: [0, 0]
      }
    });

    // Generate token
    const token = generateToken(user._id, 'rider');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Register driver with document upload
// @route   POST /api/auth/register/driver
const registerDriver = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      vehicle,
      documents
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or phone already exists'
      });
    }

    // Create user and driver in transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create user
      const user = await User.create([{
        name,
        email,
        phone,
        password,
        role: 'driver',
        currentLocation: {
          type: 'Point',
          coordinates: [0, 0]
        }
      }], { session });

      // Create driver profile
      const driver = await Driver.create([{
        user: user[0]._id,
        vehicle,
        documents: {
          drivingLicense: documents.drivingLicense,
          rcBook: documents.rcBook,
          insurance: documents.insurance,
          permit: documents.permit
        },
        emergencyContact: documents.emergencyContact,
        bankAccount: documents.bankAccount,
        workingHours: documents.workingHours,
        currentlyInCity: documents.city
      }], { session });

      await session.commitTransaction();

      const token = generateToken(user[0]._id, 'driver');

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user[0]._id,
          name: user[0].name,
          email: user[0].email,
          phone: user[0].phone,
          role: 'driver',
          driverId: driver[0]._id,
          isApproved: false
        }
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Login
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (if set)
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    // Get driver info if driver
    let driverInfo = null;
    if (user.role === 'driver') {
      const driver = await Driver.findOne({ user: user._id });
      driverInfo = driver ? {
        isApproved: driver.isApproved,
        isActive: driver.isActive,
        isOnline: driver.isOnline,
        averageRating: driver.averageRating
      } : null;
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        profileImage: user.profileImage,
        driverInfo
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Verify OTP (Firebase)
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, firebaseVerificationId } = req.body;

    // In development, accept any 6-digit OTP
    if (process.env.NODE_ENV === 'development') {
      const user = await User.findOne({ phone });
      if (user) {
        user.isVerified = true;
        await user.save();
        const token = generateToken(user._id, user.role);
        return res.json({
          success: true,
          token,
          user: { id: user._id, phone: user.phone, role: user.role }
        });
      } else {
        const newUser = await User.create({
          phone,
          role: 'rider',
          isVerified: true,
          currentLocation: { type: 'Point', coordinates: [0, 0] }
        });
        const token = generateToken(newUser._id, 'rider');
        return res.json({
          success: true,
          token,
          user: { id: newUser._id, phone: newUser.phone, role: 'rider' }
        });
      }
    }

    // Production Firebase verification would go here
    res.status(501).json({ error: 'OTP verification not configured' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'OTP sent successfully (development mode: use 123456)'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    let driverProfile = null;
    if (user.role === 'driver') {
      driverProfile = await Driver.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user,
      driverProfile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, profileImage } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (profileImage) updates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update user location
// @route   PUT /api/auth/location
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      'currentLocation.coordinates': [longitude, latitude]
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerRider,
  registerDriver,
  login,
  verifyOTP,
  resendOTP,
  getProfile,
  updateProfile,
  updateLocation
};