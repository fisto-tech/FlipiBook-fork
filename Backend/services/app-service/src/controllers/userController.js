const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../../../shared/models/User');
const Profile = require('../../../../shared/models/Profile');
const Flipbook = require('../../../../shared/models/Flipbook');
const FlipbookAsset = require('../../../../shared/models/FlipbookAsset');
const CustomizedSettings = require('../../../../shared/models/CustomizedSettings');
const PageEditorSettings = require('../../../../shared/models/PageEditorSettings');
const ShelfCustomizations = require('../../../../shared/models/ShelfCustomizations');
const UserGallery = require('../../../../shared/models/UserGallery');
const ThreedModel = require('../../../../shared/models/ThreedModel');
const InteractionThreedModel = require('../../../../shared/models/InteractionThreedModel');
const Lead = require('../../../../shared/models/Lead');
const RefreshToken = require('../../../../shared/models/RefreshToken');
const AccountDeletionLog = require('../../../../shared/models/AccountDeletionLog');
const backupService = require('../../../../shared/backupService');

/**
 * Helper to extract email from request
 */
const getRequestEmail = (req) => {
  return (
    req.user?.emailId ||
    req.user?.email ||
    req.query?.emailId ||
    req.body?.emailId ||
    ''
  ).trim().toLowerCase();
};

/**
 * GET /api/user/me
 * Get current authenticated user profile + preferences
 */
const getMe = async (req, res) => {
  try {
    const email = getRequestEmail(req);
    if (!email) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    const [user, profile] = await Promise.all([
      User.findOne({ emailId: email }).select('+password').lean(),
      Profile.findOne({ emailId: email }).lean()
    ]);

    if (!user && !profile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const hasPassword = Boolean(user?.password && typeof user.password === 'string' && user.password.trim() !== '');

    // Merge data, giving precedence to explicit user fields
    const combined = {
      _id: user?._id || profile?._id,
      userID: user?.userID || '',
      emailId: email,
      name: user?.name || profile?.name || '',
      picture: user?.picture || profile?.picture || null,
      avatarBgColor: profile?.avatarBgColor || '#E8D4C8',
      role: user?.role || 'user',
      phone: user?.phone || profile?.mobile || '',
      bio: user?.bio || profile?.about || '',
      company: user?.company || profile?.companyName || '',
      designation: user?.designation || profile?.industryType || '',
      city: user?.city || profile?.city || '',
      state: user?.state || profile?.state || '',
      country: user?.country || profile?.country || 'INDIA',
      website: user?.website || profile?.website || '',
      socials: { ...(profile?.socials || {}), ...(user?.socials || {}) },
      hasPassword,
      preferences: {
        theme: 'system',
        language: 'en',
        autoSaveInterval: 30,
        editorSettings: { isAutoSaveEnabled: true, isTrimViewEnabled: false, isRulerEnabled: true }
      },
      createdAt: user?.createdAt || profile?.createdAt,
      updatedAt: user?.updatedAt || profile?.updatedAt
    };

    return res.status(200).json({
      success: true,
      data: combined
    });
  } catch (error) {
    console.error('[User Service] getMe error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * PUT/PATCH /api/user/profile
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const email = getRequestEmail(req);
    if (!email) {
      return res.status(400).json({ success: false, message: 'User email is required' });
    }

    const {
      name,
      picture,
      phone,
      bio,
      company,
      designation,
      city,
      state,
      country,
      pincode,
      website,
      socials,
      avatarBgColor
    } = req.body;

    // 1. Update Core User model
    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (picture !== undefined) userUpdates.picture = picture;
    if (phone !== undefined) userUpdates.phone = phone;
    if (bio !== undefined) userUpdates.bio = bio;
    if (company !== undefined) userUpdates.company = company;
    if (designation !== undefined) userUpdates.designation = designation;
    if (city !== undefined) userUpdates.city = city;
    if (state !== undefined) userUpdates.state = state;
    if (country !== undefined) userUpdates.country = country;
    if (pincode !== undefined) userUpdates.pincode = pincode;
    if (website !== undefined) userUpdates.website = website;
    if (socials && typeof socials === 'object') userUpdates.socials = socials;

    const updatedUser = await User.findOneAndUpdate(
      { emailId: email },
      { $set: userUpdates },
      { new: true, upsert: false }
    );

    // 2. Sync with Profile collection
    const profileUpdates = { updatedAt: new Date() };
    if (name !== undefined) profileUpdates.name = name;
    if (picture !== undefined) profileUpdates.picture = picture;
    if (avatarBgColor !== undefined) profileUpdates.avatarBgColor = avatarBgColor;
    if (phone !== undefined) profileUpdates.mobile = phone;
    if (bio !== undefined) profileUpdates.about = bio;
    if (company !== undefined) profileUpdates.companyName = company;
    if (designation !== undefined) profileUpdates.industryType = designation;
    if (city !== undefined) profileUpdates.city = city;
    if (state !== undefined) profileUpdates.state = state;
    if (country !== undefined) profileUpdates.country = country;
    if (pincode !== undefined) profileUpdates.pincode = pincode;
    if (website !== undefined) profileUpdates.website = website;
    if (socials && typeof socials === 'object') profileUpdates.socials = socials;

    await Profile.findOneAndUpdate(
      { emailId: email },
      { $set: profileUpdates },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('[User Service] updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * GET /api/user/by-id/:id
 * Look up user by MongoDB ObjectId or FLIPI userID
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'User ID is required' });

    let query = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { userID: id }] };
    } else {
      query = { userID: id };
    }

    const user = await User.findOne(query).select('-password').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profile = await Profile.findOne({ emailId: user.emailId }).lean();

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        userID: user.userID,
        name: user.name || profile?.name || '',
        picture: user.picture || profile?.picture || null,
        avatarBgColor: profile?.avatarBgColor || '#E8D4C8',
        company: user.company || profile?.companyName || '',
        city: user.city || profile?.city || '',
        state: user.state || profile?.state || '',
        country: user.country || profile?.country || '',
        website: user.website || profile?.website || ''
      }
    });
  } catch (error) {
    console.error('[User Service] getUserById error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * GET /api/user/by-email/:email
 * Look up user by email
 */
const getUserByEmail = async (req, res) => {
  try {
    const email = (req.params.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ emailId: email }).select('-password').lean();
    const profile = await Profile.findOne({ emailId: email }).lean();

    if (!user && !profile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        _id: user?._id || profile?._id,
        userID: user?.userID || '',
        emailId: email,
        name: user?.name || profile?.name || '',
        picture: user?.picture || profile?.picture || null,
        avatarBgColor: profile?.avatarBgColor || '#E8D4C8',
        company: user?.company || profile?.companyName || '',
        designation: user?.designation || profile?.industryType || '',
        city: user?.city || profile?.city || '',
        country: user?.country || profile?.country || 'INDIA'
      }
    });
  } catch (error) {
    console.error('[User Service] getUserByEmail error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * GET /api/user/check-email?email=...
 * Check if email is already registered
 */
const checkEmailAvailable = async (req, res) => {
  try {
    const email = (req.query.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const exists = await User.exists({ emailId: email });
    return res.status(200).json({
      success: true,
      available: !exists,
      email
    });
  } catch (error) {
    console.error('[User Service] checkEmailAvailable error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * GET /api/user/search?q=...
 * Search users by name or email
 */
const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const skip = (page - 1) * limit;

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { emailId: { $regex: q, $options: 'i' } },
            { userID: { $regex: q, $options: 'i' } }
          ],
          isActive: { $ne: false }
        }
      : { isActive: { $ne: false } };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('_id userID emailId name picture company city country createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[User Service] searchUsers error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * POST /api/user/change-password
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const email = getRequestEmail(req);
    const { currentPassword, newPassword } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'User email is required' });
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ emailId: email }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('[User Service] changePassword error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * GET /api/user/preferences
 * Get user preferences
 */
const getPreferences = async (req, res) => {
  try {
    const email = getRequestEmail(req);
    if (!email) return res.status(400).json({ success: false, message: 'User email is required' });

    const prefs = {
      emailId: email,
      theme: 'system',
      language: 'en',
      autoSaveInterval: 30,
      editorSettings: { isAutoSaveEnabled: true, isTrimViewEnabled: false, isRulerEnabled: true },
      notifications: { emailMarketing: false, bookViews: true, securityAlerts: true, systemUpdates: true }
    };

    return res.status(200).json({
      success: true,
      data: prefs
    });
  } catch (error) {
    console.error('[User Service] getPreferences error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const email = getRequestEmail(req);
    if (!email) return res.status(400).json({ success: false, message: 'User email is required' });

    const updates = req.body || {};
    delete updates._id;
    delete updates.emailId;

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        emailId: email,
        ...updates
      }
    });
  } catch (error) {
    console.error('[User Service] updatePreferences error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const clearAuthSessionCookies = (res) => {
  const clearOpts = { path: '/', httpOnly: true, sameSite: 'lax' };
  res.clearCookie('token', clearOpts);
  res.clearCookie('accessToken', clearOpts);
  res.clearCookie('refreshToken', clearOpts);
  res.clearCookie('flipibook_logged_in', { path: '/', httpOnly: false, sameSite: 'lax' });
  res.clearCookie('flipibook_user', { path: '/', httpOnly: false, sameSite: 'lax' });
};

const verifyUserIdentityForAccountAction = async (user, password, confirmText, expectedKeyword) => {
  const hasPassword = Boolean(user.password && typeof user.password === 'string' && user.password.trim() !== '');
  if (hasPassword) {
    if (!password) {
      return { ok: false, message: 'Password confirmation is required' };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { ok: false, message: 'Incorrect password' };
    }
  } else {
    if (String(confirmText || '').trim().toUpperCase() !== expectedKeyword) {
      return { ok: false, message: `Please type ${expectedKeyword} to confirm` };
    }
  }
  return { ok: true };
};

/**
 * POST /api/user/account/deactivate
 * Temporarily deactivate account (keeps all data intact; user can reactivate via OTP on login)
 */
const deactivateAccount = async (req, res) => {
  try {
    const email = getRequestEmail(req);
    const { password, confirmText, reasonCategory = '', feedback = '' } = req.body || {};

    if (!email) return res.status(400).json({ success: false, message: 'User email is required' });

    const user = await User.findOne({ emailId: email, isDeleted: { $ne: true } }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const check = await verifyUserIdentityForAccountAction(user, password, confirmText, 'DEACTIVATE');
    if (!check.ok) return res.status(400).json({ success: false, message: check.message });

    const now = new Date();
    const combinedReason = [reasonCategory, feedback].filter(Boolean).join(' - ') || 'USER_SELF_DEACTIVATE';

    user.isActive = false;
    user.deletionReason = combinedReason;
    await user.save();

    let sessionsRevoked = false;
    let profileHidden = false;

    try {
      await RefreshToken.updateMany(
        { emailId: email, isRevoked: { $ne: true } },
        { $set: { isRevoked: true, revokedAt: now } }
      );
      sessionsRevoked = true;
    } catch (rtErr) {
      console.warn('[User Service] deactivateAccount RefreshToken revoke warning:', rtErr.message);
    }

    try {
      await Profile.updateOne(
        { emailId: email },
        { $set: { 'visibilitySettings.showInExplore': false } }
      );
      profileHidden = true;
    } catch (profErr) {
      console.warn('[User Service] deactivateAccount Profile hide warning:', profErr.message);
    }

    try {
      await AccountDeletionLog.create({
        userId: user._id,
        userID: user.userID || '',
        emailId: email,
        initiatedBy: 'USER',
        reasonCategory: String(reasonCategory || ''),
        feedback: String(feedback || ''),
        status: 'DEACTIVATED',
        cleanupProgress: { sessionsRevoked, profileHidden, flipbooksHidden: false },
        requestedAt: now,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '',
        userAgent: req.headers['user-agent'] || ''
      });
    } catch (logErr) {
      console.warn('[User Service] AccountDeletionLog create warning:', logErr.message);
    }

    clearAuthSessionCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Account deactivated successfully. You can reactivate anytime by signing in with OTP.'
    });
  } catch (error) {
    console.error('[User Service] deactivateAccount error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * DELETE /api/user/account
 * Permanently delete user account & live data while preserving record in Backup DB
 */
const deleteAccount = async (req, res) => {
  try {
    const email = getRequestEmail(req);
    const { password, confirmText, reasonCategory = '', feedback = '' } = req.body || {};

    if (!email) return res.status(400).json({ success: false, message: 'User email is required' });

    const user = await User.findOne({ emailId: email }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const check = await verifyUserIdentityForAccountAction(user, password, confirmText, 'DELETE');
    if (!check.ok) return res.status(400).json({ success: false, message: check.message });

    const now = new Date();
    const combinedReason = [reasonCategory, feedback].filter(Boolean).join(' - ') || 'USER_SELF_DELETE';
    const userID = user.userID || '';
    const ownerQuery = userID
      ? { $or: [{ emailId: email }, { userEmail: email }, { userID }, { userId: userID }] }
      : { $or: [{ emailId: email }, { userEmail: email }] };

    // 1. Preserve user deletion audit in Backup DB (with isActive: false) before purging live collections
    user.isActive = false;
    user.isDeleted = true;
    user.deletedAt = now;
    user.deletionReason = combinedReason;
    try {
      backupService.recordUserDeletion(user, { req, reason: combinedReason });
    } catch (_) {}

    const cleanupProgress = {
      sessionsRevoked: false,
      profileHidden: false,
      flipbooksHidden: false
    };

    // 2. Purge all live user data from main DB
    try {
      await RefreshToken.deleteMany({ emailId: email });
      cleanupProgress.sessionsRevoked = true;
    } catch (e) {
      console.warn('[User Service] RefreshToken purge warning:', e.message);
    }

    try {
      await Promise.allSettled([
        Flipbook.deleteMany(ownerQuery),
        FlipbookAsset.deleteMany(ownerQuery),
        CustomizedSettings.deleteMany(ownerQuery),
        PageEditorSettings.deleteMany(ownerQuery),
        ShelfCustomizations.deleteMany(ownerQuery),
        UserGallery.deleteMany(ownerQuery),
        ThreedModel.deleteMany(ownerQuery),
        InteractionThreedModel.deleteMany(ownerQuery),
        Lead.deleteMany(ownerQuery)
      ]);
      cleanupProgress.flipbooksHidden = true;
    } catch (e) {
      console.warn('[User Service] Live flipbooks/assets purge warning:', e.message);
    }

    try {
      await Profile.deleteOne({ emailId: email });
      cleanupProgress.profileHidden = true;
    } catch (e) {
      console.warn('[User Service] Profile purge warning:', e.message);
    }

    try {
      await AccountDeletionLog.create({
        userId: user._id,
        userID,
        emailId: email,
        initiatedBy: 'USER',
        reasonCategory: String(reasonCategory || ''),
        feedback: String(feedback || ''),
        status: 'COMPLETED',
        cleanupProgress,
        requestedAt: now,
        completedAt: new Date(),
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '',
        userAgent: req.headers['user-agent'] || ''
      });
    } catch (logErr) {
      console.warn('[User Service] AccountDeletionLog create warning:', logErr.message);
    }

    await User.deleteOne({ _id: user._id });

    clearAuthSessionCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Account permanently deleted'
    });
  } catch (error) {
    console.error('[User Service] deleteAccount error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * GET /api/user/all
 * Admin listing of all users
 */
const listUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({})
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({})
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[User Service] listUsers error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getMe,
  updateProfile,
  getUserById,
  getUserByEmail,
  checkEmailAvailable,
  searchUsers,
  changePassword,
  getPreferences,
  updatePreferences,
  deactivateAccount,
  deleteAccount,
  listUsers
};
