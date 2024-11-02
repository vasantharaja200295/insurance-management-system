// routes/api/notifications.js
const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notificationController');
const { authenticateUser } = require('../../middlewares/auth');

router.get('/', authenticateUser, notificationController.getUserNotifications);
router.put('/:id/read', authenticateUser, notificationController.markAsRead);

module.exports = router;
