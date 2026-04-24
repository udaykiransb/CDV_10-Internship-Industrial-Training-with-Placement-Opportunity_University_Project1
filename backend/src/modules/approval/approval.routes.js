const express = require('express');
const router = express.Router();
const approvalController = require('./approval.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// @route   POST /api/v1/approval/request
// @desc    Submit an internship approval request (Student)
// @access  Private (Student)
router.post(
    '/request',
    authMiddleware,
    roleMiddleware(['student']),
    approvalController.create
);

// @route   GET /api/v1/approval/:requestId/timeline
// @desc    Get approval request history/timeline
// @access  Private (Owner, Admin, Faculty)
router.get('/:requestId/timeline', authMiddleware, approvalController.getTimeline);

// @route   GET /api/v1/approval/my
// @desc    Get logged in student's approval requests
// @access  Private (Student)
router.get(
    '/my',
    authMiddleware,
    roleMiddleware(['student']),
    approvalController.getMyRequests
);

// @route   GET /api/v1/approval/pending
// @desc    Get pending requests for specific role
// @access  Private (Faculty, Coordinator, HOD, Dean, Admin)
router.get(
    '/pending',
    authMiddleware,
    roleMiddleware(['faculty', 'coordinator', 'hod', 'dean', 'admin']),
    approvalController.getPending
);

// @route   PUT /api/v1/approval/:requestId/status
// @desc    Approve/Reject an internship request
// @access  Private (Faculty, Coordinator, HOD, Dean, Admin)
router.put(
    '/:requestId/status',
    authMiddleware,
    roleMiddleware(['faculty', 'coordinator', 'hod', 'dean', 'admin']),
    approvalController.updateStatus
);

module.exports = router;
