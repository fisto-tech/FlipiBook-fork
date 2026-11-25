const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
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
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    e_mailid: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    createddate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'De-Active'],
      default: 'Active'
    },
    // Access: Array [{"Access module name": 0 or 1}]
    Access: {
      type: Array,
      default: []
    }
  },
  {
    versionKey: false
  }
);

// Pre-save hook: auto-generate userid (starting from FLIP_AD0001) & hash password
adminUserSchema.pre('save', async function () {
  // Auto-generate userid if not present
  if (!this.userid) {
    try {
      const count = await this.constructor.countDocuments();
      this.userid = `FLIP_AD${String(count + 1).padStart(4, '0')}`;
    } catch (err) {
      this.userid = `FLIP_AD${Date.now().toString().slice(-4)}`;
    }
  }

  // Hash password if modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Helper instance method to compare passwords
adminUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
