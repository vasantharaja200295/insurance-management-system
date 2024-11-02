const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Plan = require("../models/Plan");
const {
  calculateMonthlyRevenue,
  calculateYearlyRevenue,
} = require("../utils/revenueCalculator");
const { validationResult } = require("express-validator");
const AuditLog = require("../models/AuditLogs");

const adminController = {
  async getSystemStats(req, res) {
    try {
      const [
        totalCustomers,
        totalAgents,
        activeAppointments,
        completedAppointments,
        totalPlans,
        monthlyRevenue,
        yearlyRevenue,
      ] = await Promise.all([
        User.countDocuments({ role: "customer" }),
        User.countDocuments({ role: "agent" }),
        Appointment.countDocuments({ status: "SCHEDULED" }),
        Appointment.countDocuments({ status: "COMPLETED" }),
        Plan.countDocuments({ isActive: true }),
        calculateMonthlyRevenue(),
        calculateYearlyRevenue(),
      ]);

      res.json({
        totalCustomers,
        totalAgents,
        activeAppointments,
        completedAppointments,
        totalPlans,
        revenueMetrics: {
          monthly: monthlyRevenue,
          yearly: yearlyRevenue,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching statistics", error: error.message });
    }
  },

  async getUserManagementList(req, res) {
    try {
      const { role, page = 1, limit = 10, search, status } = req.query;

      const query = {};
      if (role) query.role = role;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { fullName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ];
      }

      const users = await User.find(query)
        .select("-password")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.json({
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching users", error: error.message });
    }
  },

  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.status = status;
      await user.save();

      res.json({ message: "User status updated successfully", user });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating user status", error: error.message });
    }
  },
  async getAuditLogs(req, res) {
    try {
      const { page = 1, limit = 10, type, startDate, endDate } = req.query;

      const query = {};
      if (type) query.type = type;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const auditLogs = await AuditLog.find(query)
        .populate("userId", "fullName email")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await AuditLog.countDocuments(query);

      res.json({
        logs: auditLogs,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching audit logs", error: error.message });
    }
  },

  async getDashboardMetrics(req, res) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        recentAppointments,
        recentCustomers,
        agentPerformance,
        planMetrics,
      ] = await Promise.all([
        // Get recent appointments
        Appointment.find({ createdAt: { $gte: thirtyDaysAgo } })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("customerId", "fullName")
          .populate("agentId", "fullName"),

        // Get recent customers
        User.find({
          role: "customer",
          createdAt: { $gte: thirtyDaysAgo },
        })
          .sort({ createdAt: -1 })
          .limit(5),

        // Get agent performance metrics
        Appointment.aggregate([
          {
            $match: {
              status: "COMPLETED",
              createdAt: { $gte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: "$agentId",
              completedAppointments: { $sum: 1 },
              averageRating: { $avg: "$rating" },
            },
          },
          {
            $sort: { completedAppointments: -1 },
          },
          {
            $limit: 5,
          },
        ]),

        // Get plan metrics
        Plan.aggregate([
          {
            $match: { isActive: true },
          },
          {
            $group: {
              _id: "$coverage.type",
              totalPlans: { $sum: 1 },
              averagePremium: { $avg: "$premium.amount" },
            },
          },
        ]),
      ]);

      res.json({
        recentActivity: {
          appointments: recentAppointments,
          customers: recentCustomers,
        },
        performance: {
          agents: agentPerformance,
        },
        plans: planMetrics,
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error fetching dashboard metrics",
          error: error.message,
        });
    }
  },
};

module.exports = adminController;
