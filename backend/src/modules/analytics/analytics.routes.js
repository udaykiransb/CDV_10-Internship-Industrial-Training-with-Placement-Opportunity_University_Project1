const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// @route   GET /api/v1/analytics/global
// @desc    Get global statistics (Admin only)
// @access  Private (Admin)
router.get(
    '/global',
    authMiddleware,
    roleMiddleware(['admin']),
    analyticsController.getGlobalStats
);

// @route   GET /api/v1/analytics/placement
// @desc    Get placement-specific statistics (Placement Cell / Admin)
// @access  Private (Admin, coordinator)
router.get(
    '/placement',
    authMiddleware,
    roleMiddleware(['admin', 'coordinator']),
    analyticsController.getPlacementStats
);

// @route   GET /api/v1/analytics/admin
// @desc    Get admin/institutional statistics (Admin, Dean, HOD)
// @access  Private (Admin, dean, hod)
router.get(
    '/admin',
    authMiddleware,
    roleMiddleware(['admin', 'dean', 'hod']),
    analyticsController.getAdminStats
);

// @route   GET /api/v1/analytics/rich
// @desc    Get visual-rich analytics (Admin, Dean, HOD)
// @access  Private (Institutional Roles)
router.get(
    '/rich',
    authMiddleware,
    roleMiddleware(['admin', 'dean', 'hod', 'coordinator']),
    analyticsController.getRichAnalytics
);

module.exports = router;
