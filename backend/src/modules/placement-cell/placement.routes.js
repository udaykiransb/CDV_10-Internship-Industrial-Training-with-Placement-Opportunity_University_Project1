const express = require('express');
const router = express.Router();
const placementController = require('./placement.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

// All routes here are protected and restricted to admin role
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

/**
 * @route GET /api/v1/placement/dashboard
 * @desc Get system-wide dashboard statistics
 */
router.get('/dashboard', placementController.getDashboardStats);

/**
 * @route GET /api/v1/placement/applications
 * @desc Get all applications with populated details
 */
router.get('/applications', placementController.getAllApplications);

/**
 * @route PUT /api/v1/placement/application-status/:id
 * @desc Update the status of a specific application
 */
router.put('/application-status/:id', placementController.updateApplicationStatus);

/**
 * @route POST /api/v1/admin/assign-faculty
 * @desc Assign a faculty member to students
 */
router.post('/assign-faculty', placementController.assignFaculty);

/**
 * @route POST /api/v1/admin/assign-role
 * @desc Dynamically assign role to a user
 */
router.post('/assign-role', placementController.assignRole);

module.exports = router;
