const { AdminRole, AdminUser } = require('../models');

// ── ADMIN ROLES CONTROLLER ──────────────────────────────────────────────

// GET /api/admin/roles
const getRoles = async (req, res) => {
  try {
    const roles = await AdminRole.find({ isActive: true }).sort({ createdAt: 1 }).lean();
    return res.status(200).json({ success: true, roles });
  } catch (err) {
    console.error('[getRoles error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/roles
const createRole = async (req, res) => {
  try {
    const { roleName, designation, permissions, applyTo } = req.body;
    if (!roleName || !roleName.trim()) {
      return res.status(400).json({ success: false, message: 'Role Name is required' });
    }

    const cleanName = roleName.trim();
    // Count existing to generate ID or let pre-save hook generate it
    const roleCount = await AdminRole.countDocuments();
    const roleId = `R_ID${String(roleCount + 1).padStart(2, '0')}`;

    const newRole = await AdminRole.create({
      roleId,
      roleName: cleanName,
      designation: (designation || cleanName).trim(),
      applyTo: applyTo || 'All',
      permissions: permissions || []
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
    const { targetKey, permissions, applyTo, appliedPersonName, appliedPersonId } = req.body;
    if (!targetKey) {
      return res.status(400).json({ success: false, message: 'Target key is required' });
    }

    // Resolve person name and id if provided or if targetKey is a user
    let personName = appliedPersonName || '';
    let personId = appliedPersonId || '';

    // 1. If an individual person was selected (or targetKey is a specific User ID)
    const specificUserId = personId || (targetKey && targetKey.startsWith('FLIP_') ? targetKey : null);
    const userMatch = specificUserId
      ? await AdminUser.findOne({ $or: [{ userId: specificUserId }, { email: specificUserId.toLowerCase() }] })
      : await AdminUser.findOne({ $or: [{ userId: targetKey }, { email: targetKey.toLowerCase() }] });

    if (userMatch) {
      // Update individual user's permissions in adminusers
      userMatch.permissions = permissions || [];
      await userMatch.save();

      personName = userMatch.name;
      personId = userMatch.userId;
      const desig = userMatch.designation || 'Staff';

      // Store a SEPARATE individual role record for this specific person
      const roleCount = await AdminRole.countDocuments();
      const updatedPersonRole = await AdminRole.findOneAndUpdate(
        {
          appliedPersonId: personId
        },
        {
          $set: {
            roleName: `${desig} - ${personName}`,
            designation: desig,
            permissions: permissions || [],
            applyTo: `${personName} (${personId})`,
            appliedPersonName: personName,
            appliedPersonId: personId,
            isActive: true
          },
          $setOnInsert: {
            roleId: userMatch.roleId || `R_ID${String(roleCount + 1).padStart(2, '0')}`,
            isDefault: false,
            createdBy: 'system'
          }
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true, user: userMatch, role: updatedPersonRole });
    }

    // 2. Otherwise update or create general role document for the designation
    const cleanTarget = targetKey.replace(/^All\s+/i, '').trim();
    const roleCount = await AdminRole.countDocuments();
    const updatedRole = await AdminRole.findOneAndUpdate(
      {
        designation: cleanTarget,
        appliedPersonId: { $in: ['', null, undefined] }
      },
      {
        $set: {
          roleName: cleanTarget,
          designation: cleanTarget,
          permissions: permissions || [],
          applyTo: applyTo || 'All',
          isActive: true
        },
        $setOnInsert: {
          roleId: `R_ID${String(roleCount + 1).padStart(2, '0')}`,
          isDefault: false,
          createdBy: 'system'
        }
      },
      { upsert: true, new: true }
    );

    // Sync all members under this designation into appliedPersons array
    if (updatedRole) {
      await AdminUser.updateMany(
        { designation: updatedRole.designation || updatedRole.roleName },
        { $set: { permissions: permissions || [] } }
      ).catch(() => {});

      await syncAppliedPersons(updatedRole);
    }

    return res.status(200).json({ success: true, role: updatedRole });
  } catch (err) {
    console.error('[updateRolePermissions error]:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN STAFF USERS CONTROLLER ────────────────────────────────────────

// GET /api/admin/management-users
const getAdminUsers = async (req, res) => {
  try {
    // Ensure default Super Admin exists in AdminUser collection
    const superAdminExists = await AdminUser.findOne({
      $or: [{ userId: 'Admin' }, { email: 'admin@flipibook.com' }],
      isDeleted: false
    });

    if (!superAdminExists) {
      await AdminUser.create({
        userId: 'Admin',
        name: 'Super Administrator',
        email: 'admin@flipibook.com',
        designation: 'Admin',
        roleId: 'R_ID01',
        teamHead: true,
        password: 'Admin@123',
        rawPassword: 'Admin@123',
        status: 'Active'
      }).catch((createErr) => {
        console.warn('[Ensure SuperAdmin Warning]:', createErr.message);
      });
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
    const { name, email, designation, roleId, teamHead, password } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    const userCount = await AdminUser.countDocuments();
    const userId = `FLIP_AD${String(userCount + 1).padStart(4, '0')}`;
    const cleanEmail = email ? email.trim().toLowerCase() : `admin_${Date.now()}@flipibook.com`;

    // Initially, user ID is set as password if not explicitly typed
    const effectivePassword = password && password.trim() ? password.trim() : userId;

    const newUser = await AdminUser.create({
      userId,
      name: name.trim(),
      email: cleanEmail,
      designation: designation || 'Staff',
      roleId: roleId || '',
      teamHead: Boolean(teamHead),
      password: effectivePassword,
      rawPassword: effectivePassword,
      status: 'Active'
    });

    return res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('[createAdminUser error]:', err);
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

    const user = await AdminUser.findOne({ $or: [{ userId: id }, { _id: id }] });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password.trim();
    user.rawPassword = password.trim();
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
      { $or: [{ userId: id }, { _id: id }] },
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
  updateAdminUserPassword,
  deleteAdminUser
};
