// controllers/notificationController.js
const NotificationService = require('../services/notificationService');
const notificationService = new NotificationService();

const notificationController = {
  async getUserNotifications(req, res) {
    try {
      const notifications = await notificationService.getUserNotifications(
        req.user.id,
        req.query
      );
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user.id
      );
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: 'Error marking notification as read', error: error.message });
    }
  }
};

module.exports = notificationController;