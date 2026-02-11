import * as SibApiV3Sdk from '@getbrevo/brevo';
import { ApiError } from "./ApiError.js"; // Importing your custom error handler

// Initialize Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export const sendResetPasswordEmail = async (email, resetUrl) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Reset your password – InstantBook 🔑";
    sendSmtpEmail.to = [{ email: email }];
    
    // Using your dedicated project email verified in Brevo
    sendSmtpEmail.sender = { 
      name: "InstantBook", 
      email: process.env.SENDER_EMAIL 
    };

    sendSmtpEmail.htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e293b;">Password Reset Request</h2>
        <p style="color: #475569; line-height: 1.6;">
          We received a request to reset the password for your <strong>InstantBook</strong> account. 
          Click the button below to choose a new one:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="padding:12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          <strong>Note:</strong> This link will expire in 15 minutes. If you did not request this, you can safely ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          © 2026 InstantBook · Seamless Event Ticketing
        </p>
      </div>
    `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Password reset email sent. ID:", data.body.messageId);

  } catch (error) {
    console.error("❌ Brevo Reset Error:", error.response?.body || error.message);
    throw new ApiError(500, "Failed to send password reset email.");
  }
};