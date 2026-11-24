const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
      // e.g. 'FLIP_AD0001'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      select: false // Avoid exposing hashed password in regular queries
    },
    rawPassword: {
      type: String,
      default: '' // Initial plain password or userId for display in admin dashboard table
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      // e.g. 'Admin', 'SBU', 'Project Head', 'Software Developer', 'UI/UX', etc.
      index: true
    },
    roleId: {
      type: String,
      ref: 'AdminRole',
      default: 'R_ID01'
    },
    teamHead: {
      type: Boolean,
      default: false
    },
    permissions: {
      type: Array,
      default: []
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
      index: true
    },
    avatar: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to hash password if modified
adminUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper instance method to compare passwords
adminUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
