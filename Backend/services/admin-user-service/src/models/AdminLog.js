const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    timestamps: true
  }
);

adminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AdminLog || mongoose.model('AdminLog', adminLogSchema);
