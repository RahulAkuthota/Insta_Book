import * as SibApiV3Sdk from '@getbrevo/brevo';
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config();

// Initialize Brevo API Instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Use your Brevo API Key (the one starting with xkeysib-)
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Send welcome email using Brevo API
 * @param {string[]} recipients - list of email addresses
 * @param {string} user - username
 */
const sendWelcomeMail = async (recipients, user) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Welcome to InstantBook 🚀";
    
    // Convert recipients array to Brevo format: [{ email: "..." }]
    sendSmtpEmail.to = [{ email: recipients }];

    // Use the dedicated project email you verified in Brevo
    sendSmtpEmail.sender = { 
      name: "InstantBook", 
      email: process.env.SENDER_EMAIL // instantbook.contact@gmail.com
    };

    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Welcome to InstantBook</title>
        <style>
          /* Your existing CSS styles go here unchanged */
          body { margin: 0; padding: 0; background-color: #0f172a; font-family: sans-serif; }
          .wrapper { width: 100%; padding: 40px 12px; }
          .card { max-width: 620px; margin: auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 36px; text-align: center; color: #ffffff; }
          .content { padding: 36px; color: #111827; line-height: 1.7; }
          .feature-box { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; }
          .cta { text-align: center; margin: 36px 0; }
          .cta a { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; }
          .footer { text-align: center; padding: 24px; font-size: 12px; color: #6b7280; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <h1>InstantBook 🚀</h1>
              <b>Your gateway to seamless event bookings</b>
            </div>
            <div class="content">
              <h2>Hey ${user},</h2>
              <p>We’re excited to have you on <strong>InstantBook</strong>! Your account has been successfully created.</p>
              <div class="feature-box">
                <strong>What you can do with InstantBook:</strong>
                <ul>
                  <li>🎟️ Book free & paid event tickets</li>
                  <li>⚡ Instant QR-based entry passes</li>
                  <li>📩 Tickets delivered straight to your inbox</li>
                  <li>📊 Track all your bookings in one place</li>
                </ul>
              </div>
              <div class="cta">
                <a href="https://your-render-url.com/login">Get Started</a>
              </div>
              <p>Cheers,<br /><strong>The InstantBook Team</strong></p>
            </div>
            <div class="footer">© 2026 InstantBook · Built for seamless experiences</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Brevo Email sent. Message ID:", data.body.messageId);

  } catch (error) {
    // Brevo gives more detailed error responses than Nodemailer
    console.error("❌ Brevo Error:", error.response?.body || error.message);
    throw new ApiError(402, "Failed to send welcome email via Brevo.");
  }
};

export { sendWelcomeMail };