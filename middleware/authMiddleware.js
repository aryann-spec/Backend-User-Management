const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── PROTECT MIDDLEWARE (AUTHENTICATION) ─────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // 1. Check if the request contains a Bearer token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from header ("Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 2. Decode and verify the token signature using your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user in the database by ID (exclude password field for security)
      req.user = await User.findById(decoded.id);

      // 4. Pass control to the next function (the controller or next middleware)
      return next();
    } catch (error) {
      console.error('AUTH MIDDLEWARE ERROR:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  // If no token was found at all
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

// ─── 👑 ADMIN MIDDLEWARE (AUTHORIZATION / RBAC) ──────────────────────────────
// This checks if the authenticated user has the necessary 'admin' role privileges
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next(); // User is an admin! Proceed to the controller.
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};

// Export BOTH middleware functions so your router can access them cleanly!
module.exports = { protect, admin };