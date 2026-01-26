// sendOrganizerApplicationMail.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send organizer application submitted email
 * @param {string|string[]} recipients
 * @param {object} user
 * @param {string} organizationName
 */
const sendOrganizerApplicationMail = async (
  recipients,
  user,
  organizationName
) => {
  try {
    const mailOptions = {
      from: `"InstantBook" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject: "Organizer Application Submitted 🚀",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Organizer Application Submitted</title>

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
    max-width: 620px;
    margin: auto;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.25);
  }
  .header {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    padding: 36px;
    text-align: center;
    color: #ffffff;
  }
  .header h1 {
    margin: 0;
    font-size: 32px;
  }
  .content {
    padding: 36px;
    color: #111827;
    line-height: 1.7;
  }
  .content h2 {
    margin-top: 0;
    font-size: 22px;
  }
  .info-box {
    background: #f1f5f9;
    border-radius: 12px;
    padding: 18px;
    margin: 24px 0;
  }
  .footer {
    text-align: center;
    padding: 24px;
    font-size: 12px;
    color: #6b7280;
    background: #f9fafb;
  }
</style>
</head>

<body>
<div class="wrapper">
  <div class="card">

    <!-- Header -->
    <div class="header">
      <h1>Organizer Application Received 🎉</h1>
      <p>You're one step away from hosting events</p>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Hi ${user.name},</h2>

      <p>
        Thank you for applying to become an <strong>Organizer</strong> on
        <strong>InstantBook</strong>.
      </p>

      <div class="info-box">
        <strong>Organization Name:</strong><br/>
        ${organizationName}
      </div>

      <p>
        Our team is currently reviewing your application. Once approved,
        you’ll be able to:
      </p>

      <ul>
        <li>Create and publish events</li>
        <li>Sell free and paid tickets</li>
        <li>Track bookings and revenue</li>
      </ul>

      <p style="margin-top: 24px;">
        ⏳ <strong>Status:</strong> Verification Pending
      </p>

      <p>
        We’ll notify you via email as soon as your organizer account is approved.
      </p>

      <p>
        Cheers,<br/>
        <strong>The InstantBook Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      © 2026 InstantBook · Organizer Platform
    </div>

  </div>
</div>
</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Organizer application email sent");
  } catch (error) {
    console.error("❌ Error sending organizer email:", error);
    throw new ApiError(500, "Failed to send organizer application email");
  }
};

export { sendOrganizerApplicationMail };
