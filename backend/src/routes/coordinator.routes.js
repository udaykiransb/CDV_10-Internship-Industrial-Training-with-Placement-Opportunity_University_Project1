const express = require('express');
const router = express.Router();
const applicationController = require('../modules/application/application.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// All routes are protected and restricted to coordinator role
router.use(authMiddleware);
router.use(roleMiddleware(['coordinator']));

/**
 * @route GET /api/v1/coordinator/internship-requests
 * @desc Get all faculty-approved internship applications awaiting coordinator approval
 */
router.get('/internship-requests', applicationController.getPendingByLevel);

/**
 * @route PUT /api/v1/coordinator/approve/:id
 * @desc Approve an internship application (Coordinator Level)
 */
router.put('/approve/:id', applicationController.approveAtLevel);

/**
 * @route PUT /api/v1/coordinator/reject/:id
 * @desc Reject an internship application (Coordinator Level)
 */
router.put('/reject/:id', applicationController.rejectAtLevel);

module.exports = router;
