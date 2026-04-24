const express = require('express');
const router = express.Router();
const interviewController = require('./interview.controller');
const protect = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

router.post('/schedule', protect, authorize('recruiter', 'admin'), interviewController.schedule);
router.get('/my', protect, interviewController.getMyInterviews);
router.put('/:id/status', protect, authorize('recruiter', 'admin'), interviewController.updateStatus);

module.exports = router;
