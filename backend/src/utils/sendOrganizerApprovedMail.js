import * as SibApiV3Sdk from '@getbrevo/brevo';
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config();

// Initialize Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Send organizer approval email using Brevo API
 * @param {string|string[]} recipients
 * @param {string} name
 * @param {string} organizationName
 */
const sendOrganizerApprovedMail = async (
  recipients,
  name,
  organizationName
) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Organizer Account Approved 🎉";
    
    // Handle both single string or array of emails
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    sendSmtpEmail.to = recipientList.map(email => ({ email }));

    sendSmtpEmail.sender = { 
      name: "InstantBook", 
      email: process.env.SENDER_EMAIL 
    };

    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Organizer Approved</title>
<style>
  body { margin: 0; padding: 0; background-color: #0f172a; font-family: sans-serif; }
  .wrapper { width: 100%; padding: 40px 12px; }
  .card { max-width: 620px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.25); }
  .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 36px; text-align: center; color: #ffffff; }
  .header h1 { margin: 0; font-size: 32px; }
  .content { padding: 36px; color: #111827; line-height: 1.7; }
  .status-box { background: #ecfdf5; border-radius: 12px; padding: 18px; margin: 24px 0; border-left: 5px solid #22c55e; }
  .cta { text-align: center; margin: 32px 0; }
  .cta a { display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 10px; font-weight: 600; font-size: 16px; }
  .footer { text-align: center; padding: 24px; font-size: 12px; color: #6b7280; background: #f9fafb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>Organizer Approved 🎉</h1>
      <p>Your account is now fully active</p>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>We’re excited to let you know that your organizer application on <strong>InstantBook</strong> has been successfully reviewed and approved.</p>
      <div class="status-box">
        <strong>Organization:</strong><br/> ${organizationName}<br/><br/>
        <strong>Status:</strong> <span style="color:#16a34a; font-weight:700;">APPROVED ✅</span>
      </div>
      <ul>
        <li>🎉 Create and publish events</li>
        <li>🎟️ Sell free & paid tickets</li>
        <li>📩 Send QR-based tickets to attendees</li>
        <li>📊 Track bookings and earnings</li>
      </ul>
      <div class="cta">
        <a href="${process.env.FRONTEND_URL}/organizer/dashboard">Open Organizer Dashboard</a>
      </div>
      <p>Cheers,<br/><strong>The InstantBook Team</strong></p>
    </div>
    <div class="footer">© 2026 InstantBook · Built for Event Creators</div>
  </div>
</div>
</body>
</html>
      `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Organizer approval email sent via Brevo. ID:", data.body.messageId);

  } catch (error) {
    console.error("❌ Brevo Organizer Approval Error:", error.response?.body || error.message);
    throw new ApiError(500, "Failed to send organizer approval email via Brevo.");
  }
};

export { sendOrganizerApprovedMail };