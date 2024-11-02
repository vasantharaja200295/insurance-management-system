// services/notificationService.js
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.emailTransporter =  nodemailer.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: 465, 
        secure: true,
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASSWORD, 
        },
    });
  }

  async createNotification(data) {
    try {
      const notification = new Notification(data);
      await notification.save();

      // Send notifications through selected channels
      if (data.sentVia.includes('EMAIL')) {
        await this.sendEmail(data);
      }
      if (data.sentVia.includes('SMS')) {
        await this.sendSMS(data);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendEmail({ recipient, title, message }) {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: title,
        text: message
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendSMS({ recipient, message }) {
    // Implement SMS sending logic here
    // This is a placeholder for SMS implementation
    console.log('SMS sending not implemented yet');
  }

  async getUserNotifications(userId, query = {}) {
    const { page = 1, limit = 10, read } = query;
    
    const filter = { recipient: userId };
    if (read !== undefined) {
      filter.read = read;
    }

    return await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    await notification.save();
    return notification;
  }
}

module.exports = NotificationService;