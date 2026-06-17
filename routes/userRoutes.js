// routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Pull everything cleanly from your single authController file
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUserByAdmin
} = require('../controllers/authController');

// Import your verified middleware guards
const { protect, admin } = require('../middleware/authMiddleware'); 


// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);


// ─── PROTECTED USER PROFILE ROUTES ───────────────────────────────────────────
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);


// ─── 👑 ADMIN ONLY OPERATIONS (RBAC) ──────────────────────────────────────────
router.get('/admin/users', protect, admin, getAllUsers);
router.get('/admin/users/:id', protect, admin, getUserById);
router.patch('/admin/users/:id/role', protect, admin, updateUserRole);
router.delete('/admin/users/:id', protect, admin, deleteUserByAdmin);

module.exports = router;