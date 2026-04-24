const notificationService = require('./notification.service');

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await notificationService.getUserNotifications(userId);
        res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id);
        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationService.markAllAsRead(userId);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const removeNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationService.deleteNotification(id);
        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getMyNotifications,
    markRead,
    markAllRead,
    removeNotification
};
