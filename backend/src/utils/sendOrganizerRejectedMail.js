// sendOrganizerRejectedMail.js

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
 * Send organizer rejection email
 * @param {string|string[]} recipients
 * @param {object} user
 * @param {string} organizationName
 * @param {string} reason (optional)
 */
const sendOrganizerRejectedMail = async (
  recipients,
  name,
  organizationName,
  reason = "Your application did not meet our current verification criteria."
) => {
  try {
    const mailOptions = {
      from: `"InstantBook" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject: "Organizer Application Update",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Organizer Application Update</title>

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
    background: linear-gradient(135deg, #ef4444, #dc2626);
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
  .status-box {
    background: #fef2f2;
    border-radius: 12px;
    padding: 18px;
    margin: 24px 0;
    border-left: 5px solid #ef4444;
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
      <h1>Application Update</h1>
      <p>Organizer request review completed</p>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>Hi ${name},</h2>

      <p>
        Thank you for your interest in becoming an organizer on
        <strong>InstantBook</strong>.
      </p>

      <div class="status-box">
        <strong>Organization:</strong><br/>
        ${organizationName}
        <br/><br/>
        <strong>Status:</strong>
        <span style="color:#dc2626; font-weight:700;">
          REJECTED ❌
        </span>
      </div>

      <p>
        After careful review, we regret to inform you that we’re unable to
        approve your organizer application at this time.
      </p>

      <p>
        <strong>Reason:</strong><br/>
        ${reason}
      </p>

      <p>
        This decision does not prevent you from reapplying in the future.
        You may update your details and submit a new application at any time.
      </p>

      <p>
        If you believe this was a mistake or need clarification, feel free
        to contact our support team.
      </p>

      <p>
        Regards,<br/>
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
    console.log("✅ Organizer rejection email sent");
  } catch (error) {
    console.error("❌ Error sending rejection email:", error);
    throw new ApiError(500, "Failed to send organizer rejection email");
  }
};

export { sendOrganizerRejectedMail };
