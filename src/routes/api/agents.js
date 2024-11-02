// File: src/routes/api/agents.js
const express = require("express");
const router = express.Router();
const AgentController = require("../../controllers/agentController");
const { authenticateUser, authorizeRoles } = require("../../middlewares/auth");
const { validate } = require("../../middlewares/validation");
const { check } = require("express-validator");

const availabilityValidation = [
  check("availability").isArray().withMessage("Availability must be an array"),
  check("availability.*.day")
    .isIn([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ])
    .withMessage("Invalid day"),
  check("availability.*.slots").isArray().withMessage("Slots must be an array"),
  check("availability.*.slots.*.startTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Start time must be in HH:mm format"),
  check("availability.*.slots.*.endTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("End time must be in HH:mm format"),
];

router.get("/", authenticateUser, AgentController.getAllAgents);
router.get("/:agentId", authenticateUser, AgentController.getAgentDetails);
router.post(
  "/",
  [
    authenticateUser,
    authorizeRoles("agent", "admin"),
    check("specialization")
      .notEmpty()
      .withMessage("Specialization is required"),
    check("experience")
      .isInt({ min: 0 })
      .withMessage("Experience must be a positive number"),
    ...availabilityValidation,
  ],
  validate,
  AgentController.createAgent
);
router.put(
  "/:agentId/availability",
  [
    authenticateUser,
    authorizeRoles("agent", "admin"),
    ...availabilityValidation,
  ],
  validate,
  AgentController.updateAvailability
);

module.exports = router;
