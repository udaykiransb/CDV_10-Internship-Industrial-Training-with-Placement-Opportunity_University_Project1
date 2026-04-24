const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/v1/auth/login
// @desc    Login a user and return JWT token
// @access  Public
router.post('/login', authController.login);

/**
 * @route GET /api/v1/auth
 * @desc Get all users (Admin only)
 */
router.get('/', authController.getAll);

module.exports = router;
