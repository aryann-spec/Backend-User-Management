// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── REGISTER USER ────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({ fullName, email, password });
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── LOGIN USER ───────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      data: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET USER PROFILE ─────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('PROFILE ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── UPDATE USER PROFILE ──────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.fullName = req.body.fullName || user.fullName;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { id: updatedUser._id, fullName: updatedUser.fullName, email: updatedUser.email }
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── DELETE USER ACCOUNT ──────────────────────────────────────────────────────
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Account permanently deleted from cloud database'
    });
  } catch (error) {
    console.error('DELETE ACCOUNT ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── 👑 ADMIN: GET ALL USERS (Test 6) ────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── 👑 ADMIN: GET SINGLE USER (Test 7) ──────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('GET USER BY ID ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── 👑 ADMIN: UPDATE USER ROLE (Test 8) ────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid role (user or admin)' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('UPDATE ROLE ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── 👑 ADMIN: DELETE USER BY ADMIN (Test 9) ──────────────────────────────────
const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await user.deleteOne();
    return res.status(200).json({
      success: true,
      message: 'User account permanently removed by admin privilege'
    });
  } catch (error) {
    console.error('ADMIN DELETE ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Unified export map matching your original style perfectly
module.exports = { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUserByAdmin
};