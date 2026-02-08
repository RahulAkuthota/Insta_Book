// sendOtpEmail.utils.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

/**
 * Send OTP email for verification
 * @param {string} recipient - email address
 * @param {string} otp - 6 digit OTP
 */
const sendOtpEmail = async (recipient, otp) => {
  try {
    const mailOptions = {
      from: `"InstantBook" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: "Verify your email – InstantBook 🔐",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Email Verification</title>
<style>
body {
  margin: 0;
  padding: 0;
  background-color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}
.wrapper {
  width: 100%;
  padding: 40px 12px;
}
.card {
  max-width: 520px;
  margin: auto;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
}
.header {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  padding: 32px;
  text-align: center;
  color: #ffffff;
}
.header h1 {
  margin: 0;
  font-size: 28px;
}
.content {
  padding: 32px;
  color: #111827;
  text-align: center;
}
.content h2 {
  margin-top: 0;
  font-size: 22px;
}
.otp-box {
  margin: 24px auto;
  padding: 16px 24px;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 8px;
  background: #f1f5f9;
  border-radius: 12px;
  display: inline-block;
  color: #4f46e5;
}
.note {
  font-size: 14px;
  color: #6b7280;
  margin-top: 16px;
}
.warning {
  margin-top: 20px;
  font-size: 13px;
  color: #b91c1c;
}
.footer {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
}
.brand {
  font-weight: 700;
  color: #6366f1;
}
</style>
</head>

<body>
<div class="wrapper">
  <div class="card">
    <!-- Header -->
    <div class="header">
      <h1>InstantBook 🔐</h1>
      <p>Email Verification</p>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Verify your email</h2>
      <p>
        Use the OTP below to verify your email address and activate your
        <span class="brand">InstantBook</span> account.
      </p>

      <div class="otp-box">${otp}</div>

      <p class="note">
        This OTP is valid for <strong>10 minutes</strong>.
      </p>

      <p class="warning">
        If you didn’t request this, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      © 2026 InstantBook · Secure & seamless event booking
    </div>
  </div>
</div>
</body>
</html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new ApiError(500, "Failed to send OTP email");
  }
};

export { sendOtpEmail };
