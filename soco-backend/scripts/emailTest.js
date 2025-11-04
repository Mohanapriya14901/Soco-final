// scripts/emailTest.js
require("dotenv").config();
const sendMail = require("../utils/sendMail");

(async () => {
  try {
    const success = await sendMail({
      to: process.env.EMAIL_USER, // send to yourself for testing
      subject: "Test Email from SoCo",
      text: "This is a test email to check SMTP configuration.",
      html: "<p>This is a <b>test email</b> from SoCo backend.</p>",
    });

    if (success) {
      console.log("✅ Test email sent successfully");
    } else {
      console.log("❌ Failed to send test email");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
})();
