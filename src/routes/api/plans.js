// routes/api/plans.js
const express = require("express");
const router = express.Router();
const planController = require("../../controllers/planController");
const { authenticateUser } = require("../../middlewares/auth");
const { check } = require('express-validator');

// Validation rules for creating a new plan
const createPlanValidation = [
  check("name")
    .notEmpty()
    .trim()
    .withMessage("Name is required"),

  check("description")
    .notEmpty()
    .isLength({ max: 1000 })
    .withMessage("Description is required and must be less than 1000 characters"),

  check("coverage")
    .isArray()
    .notEmpty()
    .withMessage("Coverage must be a non-empty array"),

  check("coverage.*.type")
    .isIn(["HEALTH", "LIFE", "AUTO", "HOME", "DISABILITY"])
    .withMessage("Invalid coverage type"),

  check("coverage.*.amount")
    .isFloat({ min: 0 })
    .withMessage("Coverage amount must be a positive number"),

  check("premium.amount")
    .isFloat({ min: 0 })
    .withMessage("Premium amount must be a positive number"),

  check("term.duration")
    .isInt({ min: 1 })
    .withMessage("Term duration must be a positive integer")
];

// Validation rules for updating a plan
const updatePlanValidation = [
  check("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty if provided"),

  check("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters if provided"),

  check("coverage")
    .optional()
    .isArray()
    .withMessage("Coverage must be an array if provided"),

  check("coverage.*.type")
    .optional()
    .isIn(["HEALTH", "LIFE", "AUTO", "HOME", "DISABILITY"])
    .withMessage("Invalid coverage type"),

  check("coverage.*.amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Coverage amount must be a positive number"),

  check("premium.amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Premium amount must be a positive number"),

  check("term.duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Term duration must be a positive integer")
];

router.post(
  "/",
  [authenticateUser, ...createPlanValidation],
  planController.createPlan
);
router.get("/", authenticateUser, planController.getPlans);
router.get("/:id", authenticateUser, planController.getPlanById);
router.put(
  "/:id",
  [authenticateUser, ...updatePlanValidation],
  planController.updatePlan
);
router.delete("/:id", authenticateUser, planController.deletePlan);

module.exports = router;