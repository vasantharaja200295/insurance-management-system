// models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'STATUS_CHANGE']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['USER', 'APPOINTMENT', 'PLAN', 'NOTIFICATION']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  changes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;