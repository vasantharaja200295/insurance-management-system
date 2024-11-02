const Appointment = require('../models/Appointment');

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

module.exports = {
  calculateMonthlyRevenue,
  calculateYearlyRevenue
};