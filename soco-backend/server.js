// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// 1) Load env FIRST
dotenv.config();

// 2) Quick env sanity log (never print secrets)
console.log("ENV LOADED:", {
  EMAIL_USER: process.env.EMAIL_USER ? "✅ SET" : "❌ MISSING",
  EMAIL_PASS: process.env.EMAIL_PASS ? "✅ SET" : "❌ MISSING",
  FROM_EMAIL: process.env.FROM_EMAIL ? "✅ SET" : "❌ MISSING",
  MONGO_URI: process.env.MONGO_URI ? "✅ SET" : "❌ MISSING",
  PORT: process.env.PORT || 5000,
});

// 3) Create app + middleware
const app = express();
app.use(express.json());

// CORS — allow all for now (works with Expo/APK). Tighten later.
app.use(cors());
// If you want to restrict later:
// app.use(cors({ origin: ["https://your-site.com", "exp://*", "http://localhost:19006"] }));

// 4) Connect MongoDB (modern style)
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
})();

// 5) Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const testRoutes = require("./routes/testRoutes");

// Health check (use this to verify Azure is serving your app)
app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/test", testRoutes);

// 6) 404 + error handlers
app.use((req, res, _next) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  console.error("💥 Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

// 7) Start server (Azure will set PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
