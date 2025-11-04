const User = require("../models/User");
const sendMail = require("../utils/sendMail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// ============================
// Send OTP (Signup/Verification)
// ============================
exports.sendEmailOtp = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = generateOtp();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }
    await user.save();

    await sendMail({
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
      html: `<h2>Email Verification</h2>
             <p>Your OTP is: <b>${otp}</b></p>
             <p>This OTP will expire in 5 minutes.</p>`
    });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error in sendEmailOtp:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// Verify Signup OTP
// ============================
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "OTP verified successfully", token });
  } catch (err) {
    console.error("Error in verifyEmailOtp:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// Set Password (after verification)
// ============================
exports.setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isVerified: true });

    if (!user) {
      return res.status(400).json({ message: "User not found or not verified" });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: "Password set successfully" });
  } catch (err) {
    console.error("Error in setPassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// Login
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// Forgot Password - Step 1: Send Reset OTP
// ============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    await sendMail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your reset OTP is ${otp}`,
      html: `<h2>Password Reset</h2>
             <p>Your OTP is: <b>${otp}</b></p>
             <p>This OTP is valid for 5 minutes.</p>`
    });

    res.json({ message: "Reset OTP sent successfully" });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// Forgot Password - Step 2: Verify Reset OTP
// ============================
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error in verifyResetOtp:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// Forgot Password - Step 3: Reset Password
// ============================
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ message: "Server error" });
  }
};
