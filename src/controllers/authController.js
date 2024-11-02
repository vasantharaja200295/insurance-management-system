const crypto = require("crypto");
const User = require("../models/User");
const EmailService = require("../services/emailService");
const JWTService = require("../services/jwtService");

class AuthController {
  static async register(req, res, next) {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          error: "Bad Request",
          message: "User already exists",
        });
      }

      // Create verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      // Create user
      user = new User({
        firstName,
        lastName,
        email,
        password,
        role,
        verificationToken,
        verificationExpires,
      });

      await user.save();
      await EmailService.sendVerificationEmail(email, verificationToken);

      res.status(201).json({
        message:
          "Registration successful. Please check your email to verify your account.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        verificationToken: token,
        verificationExpires: { $gt: Date.now() },
      });


      if (!user) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid or expired verification token",
        });
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationExpires = undefined;
      await user.save();

      res.json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  }
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid credentials",
        });
      }

      if (!user.isVerified) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Please verify your email first",
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid credentials",
        });
      }

      const token = JWTService.generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          error: "Not Found",
          message: "User not found",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      await EmailService.sendPasswordResetEmail(email, resetToken);

      res.json({ message: "Password reset email sent" });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { password } = req.body;
      const { token } = req.params;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid or expired reset token",
        });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
