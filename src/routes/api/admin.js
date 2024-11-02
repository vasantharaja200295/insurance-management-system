// routes/api/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const {authenticateUser} = require('../../middlewares/auth');
const adminAuth = require('../../middlewares/adminAuth');
const { check } = require('express-validator');
const Appointment = require('../../models/Appointment'); // Add this import

// Utility functions for revenue calculations
async function calculateRevenue(startDate) {
  const result = await Appointment.aggregate([
    {
      $match: {
        status: 'COMPLETED',
        createdAt: { $gte: startDate }
      }
    },
    {
      $lookup: {
        from: 'plans',
        localField: 'planId',
        foreignField: '_id',
        as: 'plan'
      }
    },
    {
      $unwind: '$plan'
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$plan.premium.amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].totalRevenue : 0;
}

async function calculateMonthlyRevenue() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return await calculateRevenue(startOfMonth);
}

async function calculateYearlyRevenue() {
  const startOfYear = new Date();
  startOfYear.setMonth(0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  return await calculateRevenue(startOfYear);
}

// Apply both auth and adminAuth middleware to all routes
router.use([authenticateUser, adminAuth]);

router.get('/statistics', adminController.getSystemStats);
router.get('/users', adminController.getUserManagementList);
router.put('/users/:userId/status', [
  check('status').isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
], adminController.updateUserStatus);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/dashboard-metrics', adminController.getDashboardMetrics);

// Export utility functions along with router
module.exports = {
  router
};