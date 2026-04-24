const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { uploadPhoto, uploadResume } = require('../../middlewares/upload.middleware');

// @route   POST /api/v1/student/profile
// @desc    Create student profile
// @access  Private (student only)
router.post(
    '/profile',
    authMiddleware,
    roleMiddleware(['student']),
    studentController.createProfile
);

// @route   PUT /api/v1/student/profile
// @desc    Update student profile
// @access  Private (student only)
router.put(
    '/profile',
    authMiddleware,
    roleMiddleware(['student']),
    studentController.updateProfile
);

// @route   POST /api/v1/student/upload-photo
// @desc    Upload student profile photo
// @access  Private (student only)
router.post(
    '/upload-photo',
    authMiddleware,
    roleMiddleware(['student']),
    uploadPhoto.single('photo'),
    studentController.uploadPhoto
);

// @route   POST /api/v1/student/upload-resume
// @desc    Upload student resume (PDF)
// @access  Private (student only)
router.post(
    '/upload-resume',
    authMiddleware,
    roleMiddleware(['student']),
    uploadResume.single('resume'),
    studentController.uploadResume
);

// @route   GET /api/v1/student/profile
// @desc    Get logged in student's profile
// @access  Private (student only)
router.get(
    '/profile',
    authMiddleware,
    roleMiddleware(['student']),
    studentController.getOwnProfile
);

// @route   GET /api/v1/student/all
// @desc    Get all students
// @access  Private (admin only)
router.get(
    '/all',
    authMiddleware,
    roleMiddleware(['admin']),
    studentController.getAll
);

module.exports = router;
