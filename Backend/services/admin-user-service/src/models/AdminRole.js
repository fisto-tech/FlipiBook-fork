const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema(
  {
    Role: {
      type: String,
      required: true,
      trim: true
    },
    createdDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

adminRoleSchema.index({ Role: 1 });

module.exports = mongoose.models.AdminRole || mongoose.model('AdminRole', adminRoleSchema);
