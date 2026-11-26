const mongoose = global.mongoose || require('mongoose');

const accountDeletionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      index: true
    },
    userID: {
      type: String,
      default: '',
      index: true
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    initiatedBy: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER'
    },
    reasonCategory: {
      type: String,
      default: ''
    },
    feedback: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'DEACTIVATED', 'CLEANING_DATA', 'COMPLETED', 'CANCELLED', 'FAILED'],
      default: 'REQUESTED',
      index: true
    },
    cleanupProgress: {
      sessionsRevoked: { type: Boolean, default: false },
      profileHidden: { type: Boolean, default: false },
      flipbooksHidden: { type: Boolean, default: false }
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    scheduledFor: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AccountDeletionLog ||
  mongoose.model('AccountDeletionLog', accountDeletionLogSchema, 'account_deletion_logs');
