const express = require("express");
const router = express.Router();
const sendMail = require("../utils/sendMail");

// 📌 Simple API to test Gmail sending
router.post("/email", async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Recipient email (to) is required" });
    }

    const sent = await sendMail({
      to,
      subject: "Test Email - SoCo Backend",
      text: "This is a test email sent from API using Gmail App Password.",
      html: "<p>This is a test email sent from <b>SoCo Backend</b>.</p>"
    });

    if (sent) {
      res.json({ message: `✅ Email sent successfully to ${to}` });
    } else {
      res.status(500).json({ message: "❌ Failed to send email" });
    }
  } catch (error) {
    console.error("Email test error:", error);
    res.status(500).json({ message: "❌ Error sending email", error: error.message });
  }
});

module.exports = router;
