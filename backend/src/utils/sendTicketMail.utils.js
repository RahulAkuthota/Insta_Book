import * as SibApiV3Sdk from '@getbrevo/brevo';
import { Booking } from "../models/booking.model.js";
import { ApiError } from "./ApiError.js";

// Initialize Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendFreeTicketMail = async (bookingId) => {
  // 1️⃣ Fetch booking with relations
  const booking = await Booking.findById(bookingId)
    .populate("userId", "name email")
    .populate("eventId")
    .populate("ticketId");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (!booking.qrCodeUrl) {
    throw new ApiError(400, "QR code not generated for booking");
  }

  // 2️⃣ Prepare QR Code for Brevo (Extract Base64 part)
  // Brevo expects the raw base64 string without the "data:image/png;base64," prefix
  const base64Content = booking.qrCodeUrl.split(",")[1];

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "🎟️ Your Event Ticket - InstantBook";
    sendSmtpEmail.to = [{ email: booking.userId.email, name: booking.userId.name }];
    
    sendSmtpEmail.sender = { 
      name: "InstantBook", 
      email: process.env.SENDER_EMAIL 
    };

    // 3️⃣ Email HTML (Note the image src change)
    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f2f2f2;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;">
<tr>
<td align="center" style="padding:20px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; font-family:Arial, sans-serif; color:#222; border-radius:6px; overflow:hidden;">
<tr>
<td style="background:#2e7d32; padding:16px 24px; color:#ffffff;">
<h2 style="margin:0;">Booking Confirmed</h2>
<p style="margin:4px 0 0; font-size:13px;">Booking ID: <strong>${booking._id}</strong></p>
</td>
</tr>
<tr>
<td style="padding:20px 24px;">
<p>Hi <strong>${booking.userId.name}</strong>,</p>
<p>Your booking is confirmed. Please show this ticket at the venue.</p>
</td>
</tr>
<tr>
<td style="padding:0 24px 12px;">
<table width="100%" style="font-size:14px;">
<tr><td style="color:#888; width:35%;">Event</td><td><strong>${booking.eventId.title}</strong></td></tr>
<tr><td style="color:#888;">Date</td><td>${new Date(booking.eventId.date).toDateString()}</td></tr>
<tr><td style="color:#888;">Venue</td><td>${booking.eventId.location}</td></tr>
</table>
</td>
</tr>
<td align="center" style="padding:20px;">
<table cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="font-size:12px; color:#666; padding-top:6px;">
Show the attatched QR code at the entry gate
</td>
<tr>
<td style="padding:14px 24px; background:#fafafa; font-size:12px; color:#777; text-align:center;">
<strong>InstantBook</strong><br/>System-generated ticket.
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;

    // 4️⃣ Attachments (The Brevo Way)

    sendSmtpEmail.attachment = [{
      name: `${booking.eventId.title}.png`,
      content: base64Content,
      contentId: "ticket-qr" // ADD THIS LINE
    }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Ticket Email sent via Brevo. ID:", data.body.messageId);

  } catch (error) {
    console.error("❌ Brevo Ticket Error:", error.response?.body || error.message);
    throw new ApiError(500, "Failed to send ticket email.");
  }
};

export { sendFreeTicketMail };