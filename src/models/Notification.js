// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['APPOINTMENT_REMINDER', 'STATUS_UPDATE', 'PLAN_UPDATE', 'SYSTEM_NOTIFICATION'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false
  },
  sentVia: [{
    type: String,
    enum: ['EMAIL', 'SMS', 'IN_APP'],
    required: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);