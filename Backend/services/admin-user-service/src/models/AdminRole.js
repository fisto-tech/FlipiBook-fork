const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema(
  {
    Role: {
      type: String,
      required: true,
      trim: true,
      unique: true
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

module.exports = mongoose.models.AdminRole || mongoose.model('AdminRole', adminRoleSchema);
