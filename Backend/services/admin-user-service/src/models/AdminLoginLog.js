const mongoose = require('mongoose');

const adminLoginLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      trim: true,
      index: true
      // userId (e.g. 'FLIP_AD0001') or ObjectId ref
    },
    emailOrUserId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      default: ''
    },
    designation: {
      type: String,
      default: ''
    },
    roleId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'BLOCKED'],
      required: true,
      index: true
    },
    failureReason: {
      type: String,
      default: null
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    device: {
      browser: { type: String, default: '' },
      os: { type: String, default: '' },
      type: { type: String, default: 'Desktop' }
    },
    location: {
      country: { type: String, default: '' },
      region: { type: String, default: '' },
      city: { type: String, default: '' }
    },
    sessionId: {
      type: String,
      default: ''
    },
    loginAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    logoutAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

adminLoginLogSchema.index({ createdAt: -1 });
adminLoginLogSchema.index({ emailOrUserId: 1, createdAt: -1 });

module.exports = mongoose.models.AdminLoginLog || mongoose.model('AdminLoginLog', adminLoginLogSchema);
