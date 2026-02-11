import * as SibApiV3Sdk from '@getbrevo/brevo';
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config();

// Initialize Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Send organizer rejection email using Brevo API
 * @param {string|string[]} recipients
 * @param {string} name
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
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Organizer Application Update - InstantBook";
    
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
<title>Organizer Application Update</title>
<style>
  body { margin: 0; padding: 0; background-color: #0f172a; font-family: sans-serif; }
  .wrapper { width: 100%; padding: 40px 12px; }
  .card { max-width: 620px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.25); }
  .header { background: linear-gradient(135deg, #ef4444, #dc2626); padding: 36px; text-align: center; color: #ffffff; }
  .header h1 { margin: 0; font-size: 32px; }
  .content { padding: 36px; color: #111827; line-height: 1.7; }
  .status-box { background: #fef2f2; border-radius: 12px; padding: 18px; margin: 24px 0; border-left: 5px solid #ef4444; }
  .footer { text-align: center; padding: 24px; font-size: 12px; color: #6b7280; background: #f9fafb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>Application Update</h1>
      <p>Organizer request review completed</p>
    </div>
    <div class="content">
      <h2>Hi ${name},</h2>
      <p>Thank you for your interest in becoming an organizer on <strong>InstantBook</strong>.</p>
      <div class="status-box">
        <strong>Organization:</strong><br/> ${organizationName}<br/><br/>
        <strong>Status:</strong> <span style="color:#dc2626; font-weight:700;">REJECTED ❌</span>
      </div>
      <p>After careful review, we regret to inform you that we’re unable to approve your organizer application at this time.</p>
      <p><strong>Reason:</strong><br/> ${reason}</p>
      <p>This decision does not prevent you from reapplying in the future. You may update your details and submit a new application at any time.</p>
      <p>Regards,<br/><strong>The InstantBook Team</strong></p>
    </div>
    <div class="footer">© 2026 InstantBook · Organizer Platform</div>
  </div>
</div>
</body>
</html>
      `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Organizer rejection email sent via Brevo. ID:", data.body.messageId);

  } catch (error) {
    console.error("❌ Brevo Organizer Rejection Error:", error.response?.body || error.message);
    throw new ApiError(500, "Failed to send organizer rejection email via Brevo.");
  }
};

export { sendOrganizerRejectedMail };