const express = require('express');
const router = express.Router();
const facultyController = require('./faculty.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// All routes are protected and restricted to faculty role
router.use(authMiddleware);
router.use(roleMiddleware(['faculty', 'coordinator', 'hod', 'dean']));

/**
 * @route GET /api/v1/faculty/students
 * @desc Get list of students assigned to the faculty mentor
 */
router.get('/students', facultyController.getAssignedStudents);

/**
 * @route GET /api/v1/faculty/pending-approvals
 * @desc Get all internship applications awaiting faculty approval
 */
router.get('/pending-approvals', facultyController.getPendingApprovals);

/**
 * @route PUT /api/v1/faculty/approve/:applicationId
 * @desc Approve an internship application
 */
router.put('/approve/:applicationId', facultyController.approveInternship);

/**
 * @route PUT /api/v1/faculty/reject/:applicationId
 * @desc Reject an internship application
 */
router.put('/reject/:applicationId', facultyController.rejectInternship);

/**
 * @route GET /api/v1/faculty/progress/:applicationId
 * @desc Get progress logs for a specific internship
 */
router.get('/progress/:applicationId', facultyController.getInternshipProgress);

/**
 * @route GET /api/v1/faculty/hub
 * @desc Get unified dashboard data (Mentor + Coordinator + HOD)
 */
router.get('/hub', facultyController.getUnifiedDashboard);

/**
 * @route GET /api/v1/faculty/profile
 * @desc Get faculty profile details
 */
router.get('/profile', facultyController.getFacultyProfile);

/**
 * @route PUT /api/v1/faculty/approve-at-level/:level/:applicationId
 * @desc Approve as Coordinator, HOD, etc.
 */
router.put('/approve-at-level/:level/:applicationId', facultyController.approveAsLevel);

/**
 * @route PUT /api/v1/faculty/reject-at-level/:level/:applicationId
 * @desc Reject as Coordinator, HOD, etc.
 */
router.put('/reject-at-level/:level/:applicationId', facultyController.rejectAsLevel);

module.exports = router;
