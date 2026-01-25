// sendWelcomeMail.js

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
 * Send welcome email
 * @param {string[]} recipients - list of email addresses
 */
 const sendWelcomeMail = async (recipients , user) => {
  try {
    const mailOptions = {
      from: `"InstantBook" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject: "Welcome to InstantBook 🚀",
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Welcome to InstantBook</title>
      
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
            letter-spacing: -0.5px;
          }
      
          .header p {
            margin-top: 10px;
            font-size: 16px;
            opacity: 0.95;
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
      
          .feature-box {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
          }
      
          .feature-box ul {
            margin: 0;
            padding-left: 20px;
          }
      
          .feature-box li {
            margin-bottom: 8px;
          }
      
          .cta {
            text-align: center;
            margin: 36px 0;
          }
      
          .cta a {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 10px 25px rgba(99,102,241,0.35);
          }
      
          .footer {
            text-align: center;
            padding: 24px;
            font-size: 12px;
            color: #6b7280;
            background: #f9fafb;
          }
      
          .brand {
            font-weight: 700;
            color: #6366f1;
          }
      
          @media (max-width: 600px) {
            .content {
              padding: 28px 22px;
            }
      
            .header h1 {
              font-size: 26px;
            }
          }
        </style>
      </head>
      
      <body>
        <div class="wrapper">
          <div class="card">
      
            <!-- Header -->
            <div class="header">
              <h1>InstantBook 🚀</h1>
              <b>Your gateway to seamless event bookings</b>
            </div>
      
            <!-- Content -->
            <div class="content">
              <h2>Hey ${user},</h2>
      
              <p>
                We’re excited to have you on <span class="brand">InstantBook</span>!  
                Your account has been successfully created, and you’re all set to
                explore events like never before.
              </p>
      
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
                <a href="{loginUrl}">Get Started</a>
              </div>
      
              <p>
                If you ever need help, just reply to this email —  
                we’re always here for you.
              </p>
      
              <p>
                Cheers,<br />
                <strong>The InstantBook Team</strong>
              </p>
            </div>
      
            <!-- Footer -->
            <div class="footer">
              © 2026 InstantBook · Built for seamless experiences
            </div>
      
          </div>
        </div>
      </body>
      </html>
      
    `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new ApiError(402,"Inavalid email...");
  }
};



export {sendWelcomeMail}