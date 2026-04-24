const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const protect = require('../../middlewares/auth.middleware');

router.use(protect); // All notification routes are protected

router.get('/my', notificationController.getMyNotifications);
router.put('/:id/read', notificationController.markRead);
router.put('/mark-all-read', notificationController.markAllRead);
router.delete('/:id', notificationController.removeNotification);

module.exports = router;
