// controllers/adminController.js
// Handles operations that only an admin can perform.
// Every route that uses these functions will be guarded by:
//   protect → authorizeRoles('admin')
// so by the time execution reaches here, req.user is confirmed admin.

const User = require('../models/User');

// ─── GET ALL USERS ─────────────────────────────────────────────────────────────
// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    // .select('-password') is an explicit safety net protecting user hashes
    const users = await User.find().select('-password');

    return res.status(200).json({
      success: true,
      count:   users.length,
      data:    users,
    });
  } catch (error) {
    console.error('GET ALL USERS ERROR:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── GET SINGLE USER BY ID ─────────────────────────────────────────────────────
// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── UPDATE USER ROLE ──────────────────────────────────────────────────────────
// PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role — must be 'user' or 'admin'",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }        // returns the newly updated document
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}'`,
      data:    user,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── DELETE USER ───────────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    // Prevent an admin from accidentally deleting their own active profile
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account',
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };