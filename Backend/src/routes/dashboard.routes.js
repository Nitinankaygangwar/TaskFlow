const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { asyncHandler } = require('../utils/errors');

// All dashboard routes require authentication
router.use(authMiddleware);

// Organization admin dashboard
router.get('/org', requireRole('org_admin'), asyncHandler(dashboardController.getOrgDashboard));

// Member dashboard
router.get('/member', requireRole('member'), asyncHandler(dashboardController.getMemberDashboard));

module.exports = router;
