// utils/sendMail.js

const nodemailer = require("nodemailer");
require("dotenv").config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("Missing email credentials in environment variables");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Email with text + HTML support
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - subject line
 * @param {string} options.text - plain text fallback
 * @param {string} options.html - HTML content
 */
const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || `"SOCO App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; padding:20px;">
        <h2 style="color:#4CAF50;">${subject}</h2>
        <p>${html}</p>
        <hr style="margin:20px 0;" />
        <p style="font-size:12px; color:#888;">This is an automated message. Please do not reply.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("✅ Email sent:", info.response);
  return info;
};

module.exports = sendMail;
