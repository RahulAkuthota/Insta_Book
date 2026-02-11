import * as SibApiV3Sdk from '@getbrevo/brevo';
import { Booking } from "../models/booking.model.js";
import { ApiError } from "./ApiError.js";

// Initialize Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendPaidTicketMail = async (bookingId) => {
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

// 🔍 DEBUG QR DATA
console.log("🔎 Raw qrCodeUrl starts with:", booking.qrCodeUrl?.slice(0, 50));

let base64Content;

if (booking.qrCodeUrl.includes(",")) {
  base64Content = booking.qrCodeUrl.split(",")[1];
  console.log("✅ Detected data URL format. Extracted base64.");
} else {
  base64Content = booking.qrCodeUrl;
  console.log("⚠️ No comma found. Assuming pure base64 string.");
}

console.log("📏 Base64 length:", base64Content?.length);
console.log("🧪 Base64 first 30 chars:", base64Content?.slice(0, 30));
console.log("🧪 Base64 last 30 chars:", base64Content?.slice(-30));


  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "🎟️ Your Event Ticket - InstantBook";
    sendSmtpEmail.to = [{ email: booking.userId.email, name: booking.userId.name }];
    
    sendSmtpEmail.sender = { 
      name: "InstantBook", 
      email: process.env.SENDER_EMAIL 
    };

    // 3️⃣ Email HTML (Updated for Brevo image referencing)
    sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f2f2f2;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;">
<tr>
<td align="center" style="padding:20px;">

<table width="100%" cellpadding="0" cellspacing="0"
style="max-width:600px; background:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#222;">

<!-- HEADER -->
<tr>
<td bgcolor="orange" style="padding:16px 24px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="color:#ffffff;">
<h2 style="margin:0;">Booking Confirmed</h2>
<p style="margin:4px 0 0; font-size:13px;">
Booking ID: <strong>${booking._id}</strong>
</p>
</td>
</tr>
</table>
</td>
</tr>

<!-- GREETING -->
<tr>
<td style="padding:20px 24px;">
<p>Hi <strong>${booking.userId.name}</strong>,</p>
<p>Your booking is confirmed. Please show this ticket at the venue.</p>
</td>
</tr>

<!-- EVENT DETAILS -->
<tr>
<td style="padding:0 24px 12px;">
<table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
<tr>
<td width="35%" style="color:#888;">Event</td>
<td align="right"><strong>${booking.eventId.title}</strong></td>
</tr>
<tr>
<td style="color:#888;">Date</td>
<td align="right">${new Date(booking.eventId.date).toDateString()}</td>
</tr>
<tr>
<td style="color:#888;">Event Start Time</td>
<td>${booking.eventId.startTime}</td>
</tr>
<tr>
<td style="color:#888;">Venue</td>
<td align="right">${booking.eventId.location}</td>
</tr>
</table>
</td>
</tr>

<!-- TICKET DETAILS -->
<tr>
<td style="padding:12px 24px;">
<table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
<tr>
<td width="35%" style="color:#888;">Ticket Type</td>
<td align="right">${booking.ticketId.type}</td>
</tr>
<tr>
<td style="color:#888;">Quantity</td>
<td align="right">${booking.quantity}</td>
</tr>
<tr>
<td style="color:#888;">Amount</td>
<td align="right">₹${booking.ticketId.price * booking.quantity}</td>
</tr>
<tr>
<td>Status</td>
<td align="right" style="color:#2e7d32; font-weight:bold;">
CONFIRMED
</td>
</tr>
</table>
</td>
</tr>

<!-- QR CODE -->
<tr>
<td align="center" style="padding:20px;">
<table cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="font-size:12px; color:#666; padding-top:6px;">
Show the attatched QR code at the entry gate
</td>
</tr>
</table>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="padding:14px 24px; background:#fafafa; font-size:12px; color:#777; text-align:center;">
<strong>InstaBook</strong><br/>
This is a system-generated ticket.
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>
`;

    // 4️⃣ Attachments (Base64 string)
    sendSmtpEmail.attachment = [{
      name: "ticket-qr.png",
      content: base64Content
    }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Paid Ticket Email sent via Brevo. ID:", data.body.messageId);

  } catch (error) {
    console.error("❌ Brevo Paid Ticket Error:", error.response?.body || error.message);
    throw new ApiError(500, "Failed to send paid ticket email.");
  }
};

export { sendPaidTicketMail };