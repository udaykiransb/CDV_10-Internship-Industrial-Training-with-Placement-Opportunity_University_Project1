const express = require('express');
const router = express.Router();
const opportunityController = require('./opportunity.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// @route   POST /api/v1/opportunity
// @desc    Create a new opportunity
// @access  Private (Admin, Recruiter)
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'recruiter']),
    opportunityController.create
);

// @route   GET /api/v1/opportunity/student-feed
// @desc    Get sorted opportunities for a student with match %
// @access  Private (Student)
router.get(
    '/student-feed',
    authMiddleware,
    roleMiddleware(['student']),
    opportunityController.getStudentFeed
);

// @route   GET /api/v1/opportunity
// @desc    Get active opportunities (Students) or all (Admins, Recruiters)
// @access  Private (Student, Admin, Recruiter, Faculty, Coordinator, HOD, Dean)
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['student', 'admin', 'recruiter', 'faculty', 'coordinator', 'hod', 'dean']),
    opportunityController.list
);

// @route   GET /api/v1/opportunity/:id
// @desc    Get opportunity details by ID
// @access  Private (Student, Admin, Recruiter, Faculty, Coordinator, HOD, Dean)
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware(['student', 'admin', 'recruiter', 'faculty', 'coordinator', 'hod', 'dean']),
    opportunityController.getById
);

// @route   PUT /api/v1/opportunity/:id
// @desc    Update an opportunity
// @access  Private (Admin, Recruiter)
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'recruiter']),
    opportunityController.update
);

// @route   DELETE /api/v1/opportunity/:id
// @desc    Soft delete an opportunity
// @access  Private (Admin, Recruiter)
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'recruiter']),
    opportunityController.remove
);

module.exports = router;
