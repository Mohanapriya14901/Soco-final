const express = require("express");
const router = express.Router();
const {
  sendEmailOtp,
  verifyEmailOtp,
  setPassword,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require("../controllers/userController");

// --- Auth Routes ---
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/set-password", setPassword);
router.post("/login", login);

// --- Forgot Password Routes ---
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
