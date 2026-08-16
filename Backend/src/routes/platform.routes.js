const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platform.controller');
const { asyncHandler } = require('../utils/errors');
const { authMiddleware, requirePlatformAdmin } = require('../middleware/authz.middleware');

// All platform routes require authentication and platform admin role
router.use(authMiddleware, requirePlatformAdmin);

// Dashboard
router.get('/dashboard', asyncHandler(platformController.getPlatformDashboard));

// Organizations
router.get('/organizations', asyncHandler(platformController.listOrganizations));
router.post('/organizations', asyncHandler(platformController.createOrganization));
router.get('/organizations/:organizationId', asyncHandler(platformController.getOrganization));
router.patch('/organizations/:organizationId', asyncHandler(platformController.updateOrganization));
router.delete('/organizations/:organizationId', asyncHandler(platformController.deleteOrganization));

// Users
router.get('/users', asyncHandler(platformController.listUsers));
router.get('/users/:userId', asyncHandler(platformController.getUser));
router.patch('/users/:userId/role', asyncHandler(platformController.updateUserRole));
router.delete('/users/:userId', asyncHandler(platformController.deleteUser));

// Organization membership
router.post('/organizations/:organizationId/members', asyncHandler(platformController.assignUserToOrganization));
router.patch('/organizations/:organizationId/members/:userId/promote', asyncHandler(platformController.promoteToOrgAdmin));

module.exports = router;
