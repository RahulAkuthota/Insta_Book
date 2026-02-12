import * as SibApiV3Sdk from '@getbrevo/brevo';
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config();

// Initialize Brevo API Instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set API Key
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Send email verification link using Brevo API
 * @param {string} recipient - user email
 * @param {string} verifyUrl - verification link
 */
const sendVerifyEmail = async (recipient, verifyUrl) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Verify your email – InstantBook 🔐";
    
    // For a single recipient, we still pass an array with one object
    sendSmtpEmail.to = [{ email: recipient }];

    // Using your dedicated project email
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
<title>Email Verification</title>
<style>
  body { margin: 0; padding: 0; background-color: #0f172a; font-family: sans-serif; }
  .wrapper { width: 100%; padding: 40px 12px; }
  .card { max-width: 620px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.25); }
  .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 36px; text-align: center; color: #ffffff; }
  .header h1 { margin: 0; font-size: 30px; }
  .content { padding: 36px; color: #111827; line-height: 1.7; }
  .cta { text-align: center; margin: 36px 0; }
  .cta a { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px; }
  .footer { text-align: center; padding: 24px; font-size: 12px; color: #6b7280; background: #f9fafb; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>Verify your email 🔐</h1>
    </div>
    <div class="content">
      <p>Thanks for signing up with <strong>InstantBook</strong>!</p>
      <p>Please confirm your email address to activate your account.</p>
      <div class="cta">
        <a href="${verifyUrl}">Verify Email</a>
      </div>
      <p>This link is valid for <strong>15 minutes</strong>. If you didn’t create an account, you can safely ignore this email.</p>
      <p>Cheers,<br /><strong>The InstantBook Team</strong></p>
    </div>
    <div class="footer">© 2026 InstantBook · Secure & seamless bookings</div>
  </div>
</div>
</body>
</html>
    `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Verification email sent via Brevo. ID:", data.body.messageId);

  }catch (error) {
  // Try all possible locations for the Brevo error message
  const detailedError = error.response?.body?.message || 
                        error.response?.text || 
                        error.message;
  // console.log("ACTUAL BREVO ERROR:", detailedError); 
  throw new ApiError(500, `Brevo Error: ${detailedError}`);
}
};

export { sendVerifyEmail };