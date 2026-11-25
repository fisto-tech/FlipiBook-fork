const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema(
  {
    roleId: {
      type: String,
      trim: true,
      uppercase: true,
      index: true
      // e.g. 'R_ID01', 'R_ID02' (or customized per user e.g. R_ID01_FLIP_AD0002)
    },
    roleName: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      trim: true,
      default: ''
      // e.g. 'Admin', 'Software Developer', 'UI/UX', 'Project Head', etc.
    },
    applyTo: {
      type: String,
      trim: true,
      default: 'All'
    },
    // Array of persons assigned to this role id
    appliedPersons: [
      {
        userId: { type: String, trim: true },
        name: { type: String, trim: true },
        email: { type: String, trim: true },
        permissions: { type: Array, default: [] }
      }
    ],
    // Backward-compatibility string fields
    appliedPersonName: {
      type: String,
      trim: true,
      default: ''
    },
    appliedPersonId: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    permissions: [
      {
        id: {
          type: String,
          required: true
          // e.g. 'dashboard', 'user_management', 'template_management', 'management'
        },
        name: {
          type: String,
          required: true
        },
        description: {
          type: String,
          default: ''
        },
        enabled: {
          type: Boolean,
          default: false
        },
        // Optional granular module operations (e.g., create, read, update, delete)
        actions: {
          read: { type: Boolean, default: true },
          create: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          delete: { type: Boolean, default: false }
        }
      }
    ],
    isDefault: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: String,
      default: 'system'
    },
    updatedBy: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: auto-generate roleId if not provided (e.g. R_ID01, R_ID02)
adminRoleSchema.pre('save', async function () {
  if (this.roleId) return;
  try {
    const count = await this.constructor.countDocuments();
    this.roleId = `R_ID${String(count + 1).padStart(2, '0')}`;
  } catch (err) {
    this.roleId = `R_ID${Date.now().toString().slice(-4)}`;
  }
});

adminRoleSchema.index({ roleName: 1 });
adminRoleSchema.index({ designation: 1 });

module.exports = mongoose.models.AdminRole || mongoose.model('AdminRole', adminRoleSchema);
