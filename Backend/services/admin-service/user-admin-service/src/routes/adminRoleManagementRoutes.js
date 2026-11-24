const express = require('express');
const {
  getRoles,
  createRole,
  updateRolePermissions,
  getAdminUsers,
  createAdminUser,
  updateAdminUserPassword,
  deleteAdminUser
} = require('../controllers/adminRoleManagementController');

const router = express.Router();

// Role endpoints
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.put('/roles/permissions', updateRolePermissions);

// Admin staff user endpoints
router.get('/management-users', getAdminUsers);
router.post('/management-users', createAdminUser);
router.patch('/management-users/:id/password', updateAdminUserPassword);
router.delete('/management-users/:id', deleteAdminUser);

module.exports = router;
