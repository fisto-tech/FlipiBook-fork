const { AdminRole, AdminUser } = require('../models');

// Helper to convert permissions array [ { id, name, enabled } ]
// into user's requested Access format: [ { "dashboard": 1 }, { "user_management": 0 }, ... ]
const formatPermissionsToAccess = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  return permissions.map((p) => {
    const key = p.name || p.id;
    const val = p.enabled ? 1 : 0;
    return { [key]: val };
  });
};

// ── ADMIN ROLES CONTROLLER ──────────────────────────────────────────────

// GET /api/admin/roles
const getRoles = async (req, res) => {
  try {
    // Ensure default 'Admin' role document exists in 'adminroles' collection
    const adminRoleExists = await AdminRole.findOne({ Role: { $regex: /^admin$/i } });
    if (!adminRoleExists) {
      await AdminRole.create({
        Role: 'Admin',
        createdDate: new Date()
      }).catch((e) => console.warn('[Ensure Admin Role Warning]:', e.message));
    }

    const roles = await AdminRole.find().sort({ createdAt: 1 }).lean();
    return res.status(200).json({ success: true, roles });
  } catch (err) {
    console.error('[getRoles error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/roles
const createRole = async (req, res) => {
  try {
    const { Role, roleName } = req.body;
    const targetRole = (Role || roleName || '').trim();
    if (!targetRole) {
      return res.status(400).json({ success: false, message: 'Role Name is required' });
    }

    const newRole = await AdminRole.create({
      Role: targetRole,
      createdDate: new Date()
    });

    return res.status(201).json({ success: true, role: newRole });
  } catch (err) {
    console.error('[createRole error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/roles/permissions
// Update permissions for a role or specific user
const updateRolePermissions = async (req, res) => {
  try {
    const { targetKey, permissions, applyTo, appliedPersonId, appliedPersonName } = req.body;
    if (!targetKey) {
      return res.status(400).json({ success: false, message: 'Target key is required' });
    }

    const accessList = formatPermissionsToAccess(permissions);

    // Identify if the target refers to Super Admin / Fist-O / Admin
    const isSuperAdminTarget =
      String(targetKey).toLowerCase() === 'admin' ||
      String(targetKey).toLowerCase() === 'super administrator' ||
      String(targetKey).toLowerCase() === 'fist-o' ||
      String(applyTo || '').toLowerCase() === 'admin' ||
      String(applyTo || '').toLowerCase() === 'fist-o' ||
      String(applyTo || '').toLowerCase() === 'super administrator' ||
      String(appliedPersonName || '').toLowerCase() === 'fist-o';

    if (isSuperAdminTarget) {
      // Also update or ensure Admin entry exists in AdminRole
      await AdminRole.findOneAndUpdate(
        { Role: 'Admin' },
        {
          $set: {
            Role: 'Admin',
            createdDate: new Date()
          }
        },
        { upsert: true, new: true }
      ).catch(() => { });

      const adminUser = await AdminUser.findOne({
        $or: [
          { userid: { $regex: /^admin$/i } },
          { name: { $regex: /super administrator|fist-o/i } },
          { e_mailid: 'admin@flipibook.com' }
        ]
      });

      if (adminUser) {
        adminUser.Access = accessList;
        await adminUser.save();
        return res.status(200).json({ success: true, user: adminUser });
      }
    }

    // 1. If an individual person was selected (or targetKey is a specific User ID or personId)
    const specificUserId = appliedPersonId || (targetKey && (targetKey.startsWith('FLIP_') || targetKey === 'Admin') ? targetKey : null);
    const userMatch = specificUserId
      ? await AdminUser.findOne({ $or: [{ userid: specificUserId }, { e_mailid: specificUserId.toLowerCase() }] })
      : await AdminUser.findOne({ $or: [{ userid: targetKey }, { name: targetKey }, { e_mailid: targetKey.toLowerCase() }] });

    if (userMatch) {
      // Update individual user's Access in AdminUser
      userMatch.Access = accessList;
      await userMatch.save();

      return res.status(200).json({ success: true, user: userMatch });
    }

    // 2. Otherwise update or create general role document
    const cleanTarget = targetKey.replace(/^All\s+/i, '').trim();
    const updatedRole = await AdminRole.findOneAndUpdate(
      { Role: cleanTarget },
      {
        $set: {
          Role: cleanTarget,
          createdDate: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Sync all members under this designation
    if (updatedRole) {
      await AdminUser.updateMany(
        { designation: cleanTarget },
        { $set: { Access: accessList } }
      ).catch(() => { });
    }

    return res.status(200).json({ success: true, role: updatedRole });
  } catch (err) {
    console.error('[updateRolePermissions error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN STAFF USERS CONTROLLER ────────────────────────────────────────

// Default full access for Admin
const DEFAULT_ADMIN_ACCESS = [
  { "Dashboard": 1 },
  { "3D Editor Assets": 1 },
  { "User Management": 1 },
  { "Template Management": 1 },
  { "Management": 1 }
];

// GET /api/admin/management-users
const getAdminUsers = async (req, res) => {
  try {
    // Ensure default Super Admin exists in AdminUser collection
    const superAdminExists = await AdminUser.findOne({
      $or: [{ userid: { $regex: /^admin$/i } }, { e_mailid: 'admin@flipibook.com' }],
      isDeleted: false
    });

    if (!superAdminExists) {
      await AdminUser.create({
        userid: 'ADMIN',
        name: 'Fist-O',
        designation: 'Admin',
        e_mailid: 'admin@flipibook.com',
        password: 'Admin@123',
        createddate: new Date(),
        status: 'Active',
        Access: DEFAULT_ADMIN_ACCESS
      }).catch((createErr) => {
        console.warn('[Ensure SuperAdmin Warning]:', createErr.message);
      });
    } else {
      let needsSave = false;
      if (superAdminExists.name !== 'Fist-O') {
        superAdminExists.name = 'Fist-O';
        needsSave = true;
      }
      if (!Array.isArray(superAdminExists.Access) || superAdminExists.Access.length === 0) {
        superAdminExists.Access = DEFAULT_ADMIN_ACCESS;
        needsSave = true;
      }
      if (needsSave) {
        await superAdminExists.save().catch(() => { });
      }
    }

    const users = await AdminUser.find({ isDeleted: false }).sort({ createdAt: 1 }).lean();
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('[getAdminUsers error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/management-users
const createAdminUser = async (req, res) => {
  try {
    const { name, email, e_mailid, designation, password, status, Access, permissions } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    // Auto-generate userid (starting from FLIP_AD0001)
    const userCount = await AdminUser.countDocuments();
    const userid = `FLIP_AD${String(userCount + 1).padStart(4, '0')}`;
    const cleanEmail = (e_mailid || email || `admin_${Date.now()}@flipibook.com`).trim().toLowerCase();
    const effectivePassword = password && password.trim() ? password.trim() : userid;
    const effectiveAccess = Array.isArray(Access) && Access.length > 0
      ? Access
      : (Array.isArray(permissions) ? formatPermissionsToAccess(permissions) : []);

    const newUser = await AdminUser.create({
      userid,
      name: name.trim(),
      designation: (designation || 'Staff').trim(),
      e_mailid: cleanEmail,
      password: effectivePassword,
      createddate: new Date(),
      status: status || 'Active',
      Access: effectiveAccess
    });

    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('[createAdminUser error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/management-users/:id
const updateAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, e_mailid, designation, password, status, Access, permissions } = req.body;

    const user = await AdminUser.findOne({
      $or: [{ userid: id }, { _id: id }],
      isDeleted: false
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (e_mailid || email) {
      user.e_mailid = (e_mailid || email).trim().toLowerCase();
    }
    if (designation) user.designation = designation.trim();
    if (status) user.status = status;
    if (Access || permissions) {
      user.Access = Access || formatPermissionsToAccess(permissions);
    }
    if (password && password.trim()) {
      user.password = password.trim();
    }

    await user.save();
    return res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (err) {
    console.error('[updateAdminUser error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/management-users/:id/password
const updateAdminUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || !password.trim()) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    const user = await AdminUser.findOne({ $or: [{ userid: id }, { _id: id }] });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password.trim();
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[updateAdminUserPassword error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/management-users/:id
const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params;
    await AdminUser.findOneAndUpdate(
      { $or: [{ userid: id }, { _id: id }] },
      { $set: { isDeleted: true } }
    );
    return res.status(200).json({ success: true, message: 'User marked as deleted' });
  } catch (err) {
    console.error('[deleteAdminUser error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRolePermissions,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  updateAdminUserPassword,
  deleteAdminUser
};
