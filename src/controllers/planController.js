// controllers/planController.js
const Plan = require('../models/Plan');
const { validationResult } = require('express-validator');

const planController = {
  // Create new insurance plan
  async createPlan(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const planData = {
        ...req.body,
        createdBy: req.user.id
      };

      const plan = new Plan(planData);
      await plan.save();

      res.status(201).json(plan);
    } catch (error) {
      res.status(500).json({ message: 'Error creating plan', error: error.message });
    }
  },

  // Get all plans with filtering and pagination
  async getPlans(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type, 
        minPremium, 
        maxPremium,
        isActive 
      } = req.query;

      const query = {};
      
      if (type) query['coverage.type'] = type;
      if (isActive !== undefined) query.isActive = isActive;
      if (minPremium || maxPremium) {
        query.premium = {};
        if (minPremium) query.premium.$gte = Number(minPremium);
        if (maxPremium) query.premium.$lte = Number(maxPremium);
      }

      const plans = await Plan.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const count = await Plan.countDocuments(query);

      res.json({
        plans,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching plans', error: error.message });
    }
  },

  // Get plan by ID with detailed information
  async getPlanById(req, res) {
    try {
      const plan = await Plan.findById(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching plan', error: error.message });
    }
  },

  // Update plan details
  async updatePlan(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updates = req.body;
      const plan = await Plan.findById(req.params.id);

      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      // Only admin or original creator can update
      if (req.user.role !== 'admin' && plan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this plan' });
      }

      // Use findByIdAndUpdate with proper options
      const updatedPlan = await Plan.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { 
          new: true,          // Return the updated document
          runValidators: false,  // Don't run validators for partial updates
          context: 'query'    // Required for custom validators
        }
      );

      res.json(updatedPlan);
    } catch (error) {
      res.status(500).json({ message: 'Error updating plan', error: error.message });
    }
  },

  // Delete plan (soft delete by setting isActive to false)
  async deletePlan(req, res) {
    try {
      const plan = await Plan.findById(req.params.id);
      
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      if (req.user.role !== 'admin' && plan.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this plan' });
      }

      plan.isActive = false;
      await plan.save();

      res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting plan', error: error.message });
    }
  }
};

module.exports = planController;