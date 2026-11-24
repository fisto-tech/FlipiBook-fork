const User = require('../../../../../shared/models/User');
const AdminUser = require('../models/AdminUser');
const AdminLog = require('../models/AdminLog');
const { verifyToken } = require('../utils/jwtHelper');

/**
 * Middleware: Verify Admin Access
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    let decoded = verifyToken(token);
    let email = decoded?.emailId || decoded?.email;

    // Header fallback (from API gateway or admin-frontend)
    if (!email) {
      email = req.headers['x-user-email'] || req.headers['x-admin-email'] || req.query?.adminEmail;
    }

    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

    if (!email) {
      // In local development without credentials, grant default local admin access
      if (isDev) {
        req.admin = { emailId: 'admin@flipibook.com', role: 'admin', name: 'Dev Admin' };
        return next();
      }
      return res.status(401).json({
        success: false,
        message: 'Authentication required: Admin credentials missing.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({
      $or: [{ emailId: cleanEmail }, { email: cleanEmail }]
    });

    const adminStaff = await AdminUser.findOne({
      $or: [{ email: cleanEmail }, { userId: decoded?.userId || email }],
      isDeleted: { $ne: true }
    });

    if (!user && !adminStaff) {
      // If user doesn't exist yet but is running in development mode
      if (isDev) {
        req.admin = { emailId: cleanEmail, role: 'admin', name: 'Dev Admin' };
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin user not found.'
      });
    }

    if (user && user.role !== 'admin' && user.role !== 'moderator' && user.role !== 'staff' && !user.isAdmin && !adminStaff) {
      if (isDev) {
        // In local development, automatically promote the logged-in dev user to admin role
        await User.updateOne({ _id: user._id }, { $set: { role: 'admin', isAdmin: true } });
        req.admin = {
          id: user._id,
          userID: user.userID,
          emailId: user.emailId || cleanEmail,
          name: user.name || 'Administrator',
          role: 'admin'
        };
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Access denied: Administrator privileges required.'
      });
    }

    req.admin = {
      id: user?._id || adminStaff?._id,
      userID: user?.userID || adminStaff?.userId,
      emailId: user?.emailId || adminStaff?.email || cleanEmail,
      name: user?.name || adminStaff?.name || 'Administrator',
      role: adminStaff?.designation || user?.role || 'admin'
    };

    next();
  } catch (error) {
    console.error('[AdminAuthMiddleware] Error:', error);
    res.status(500).json({ success: false, message: 'Internal authorization error', error: error.message });
  }
};

/**
 * Helper to record administrative audit logs
 */
const recordAdminLog = async ({
  adminEmail,
  adminName = 'Admin',
  action,
  targetType,
  targetId = '',
  details = {},
  ipAddress = ''
}) => {
  try {
    await AdminLog.create({
      adminEmail: (adminEmail || 'admin@flipibook.com').toLowerCase(),
      adminName,
      action,
      targetType,
      targetId: String(targetId),
      details,
      ipAddress
    });
  } catch (err) {
    console.error('[recordAdminLog Error]:', err.message);
  }
};

module.exports = {
  verifyAdmin,
  recordAdminLog
};
