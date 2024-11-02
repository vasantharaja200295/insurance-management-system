const express = require("express");
const router = express.Router();
const AuthController = require("../../controllers/authController");
const { validate } = require("../../middlewares/validation");
const { check } = require("express-validator");

const passwordValidation = [
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain at least one special character"),
];

const registerValidation = [
  check("firstName").trim().notEmpty().withMessage("First name is required"),
  check("lastName").trim().notEmpty().withMessage("Last name is required"),
  check("email").isEmail().withMessage("Please provide a valid email"),
  ...passwordValidation,
  check("role")
    .isIn(["customer", "agent", "admin"])
    .withMessage("Invalid role"),
];

router.post("/register", registerValidation, validate, AuthController.register);
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please provide a valid email"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  AuthController.login
);
router.get("/verify/:token", AuthController.verifyEmail);
router.post(
  "/forgot-password",
  [check("email").isEmail().withMessage("Please provide a valid email")],
  validate,
  AuthController.forgotPassword
);
router.post(
  "/reset-password/:token",
  passwordValidation,
  validate,
  AuthController.resetPassword
);

module.exports = router;
