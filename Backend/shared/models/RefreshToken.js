const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userCanonicalId: {
    type: String,
    index: true,
  },
  emailId: {
    type: String,
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  deviceId: {
    type: String,
    index: true,
  },
  deviceInfo: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true,
  },
  revokedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Native MongoDB TTL index: automatically purges expired records
  },
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
