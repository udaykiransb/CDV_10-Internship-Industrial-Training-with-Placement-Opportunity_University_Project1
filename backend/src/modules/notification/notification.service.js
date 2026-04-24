const Notification = require('./notification.model');

/**
 * Create a new notification
 */
const createNotification = async (data) => {
    const notification = new Notification(data);
    return await notification.save();
};

/**
 * Get all notifications for a user
 */
const getUserNotifications = async (userId) => {
    return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
};

/**
 * Mark a notification as read
 */
const markAsRead = async (notificationId) => {
    return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
    return await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId) => {
    return await Notification.findByIdAndDelete(notificationId);
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
