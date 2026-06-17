// models/User.js
// The MODEL in MVC. Its only job is to define the shape of a User document
// in MongoDB and handle any data-level logic (like password hashing).
// It knows nothing about HTTP requests or responses — that is the controller's job.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── 1. SCHEMA ────────────────────────────────────────────────────────────────
// A Schema is a blueprint. It tells Mongoose exactly what fields a User
// document must have, their types, and any validation rules.

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type:     String,
      required: [true, 'Full name is required'],
      trim:     true,                   // strips leading/trailing whitespace
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,                  // MongoDB enforces no two users share an email
      lowercase: true,                  // "User@Email.com" → "user@email.com" before save
      trim:      true,
    },

    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false, // IMPORTANT: excludes password from all query results by default
                        // You must explicitly use .select('+password') when you need it
    },

    // 🆕 RBAC ADDITION: Role-Based Access Control configuration
    role: {
      type:      String,
      enum:      ['user', 'admin'],     // Only these two values are accepted
      default:   'user',                // Every new registration defaults to a regular user
    },
  },
  {
    timestamps: true, // Mongoose auto-adds `createdAt` and `updatedAt` fields
  }
);

// ─── 2. PRE-SAVE HOOK ──────────────────────────────────────────────────────────
// "pre('save')" means: run this function automatically BEFORE every .save() call.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return; // skip if password unchanged

  const saltRounds  = 12;                                         // cost factor — higher = slower = safer
  this.password     = await bcrypt.hash(this.password, saltRounds); // overwrite plaintext with hash
});

// ─── 3. INSTANCE METHOD: comparePassword ──────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── 4. MODEL & EXPORT ────────────────────────────────────────────────────────
const User = mongoose.model('User', userSchema);

module.exports = User;