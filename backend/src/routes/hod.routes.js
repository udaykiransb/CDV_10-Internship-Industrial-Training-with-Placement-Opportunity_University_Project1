const express = require('express');
const router = express.Router();
const applicationController = require('../modules/application/application.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// All routes are protected and restricted to hod role
router.use(authMiddleware);
router.use(roleMiddleware(['hod']));

/**
 * @route GET /api/v1/hod/internship-requests
 * @desc Get all applications awaiting HOD approval
 */
router.get('/internship-requests', applicationController.getPendingByLevel);

/**
 * @route PUT /api/v1/hod/approve/:id
 * @desc Approve an internship application (HOD Level)
 */
router.put('/approve/:id', applicationController.approveAtLevel);

/**
 * @route PUT /api/v1/hod/reject/:id
 * @desc Reject an internship application (HOD Level)
 */
router.put('/reject/:id', applicationController.rejectAtLevel);

module.exports = router;
