import nodemailer from "nodemailer";
import { Booking } from "../models/booking.model.js";
import { ApiError } from "./ApiError.js";

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

  // 2️⃣ Convert Base64 QR → Buffer (CRITICAL)
  const base64Data = booking.qrCodeUrl.replace(
    /^data:image\/png;base64,/,
    ""
  );
  const qrBuffer = Buffer.from(base64Data, "base64");

  // 3️⃣ Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
  });

  // 4️⃣ Email HTML (CID reference)
  const htmlContent = `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f2f2f2;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;">
<tr>
<td align="center" style="padding:20px;">
<table width="100%" cellpadding="0" cellspacing="0"
style="max-width:600px; background:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#222; border-radius:6px; overflow:hidden;">

<tr>
<td style="background:green; padding:16px 24px; color:#ffffff;">
<h2 style="margin:0;">Booking Confirmed</h2>
<p style="margin:4px 0 0; font-size:13px;">
Booking ID: <strong>${booking._id}</strong>
</p>
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
<tr>
<td style="color:#888; width:35%;">Event</td>
<td><strong>${booking.eventId.title}</strong></td>
</tr>
<tr>
<td style="color:#888;">Date</td>
<td>${new Date(booking.eventId.date).toDateString()}</td>
</tr>
<tr>
<td style="color:#888;">Event Start Time</td>
<td>${booking.eventId.startTime}</td>
</tr>
<tr>
<td style="color:#888;">Venue</td>
<td>${booking.eventId.location}</td>
</tr>
</table>
</td>
</tr>

<tr>
<td style="padding:12px 24px;">
<table width="100%" style="font-size:14px;">
<tr>
<td style="color:#888; width:35%;">Ticket Type</td>
<td>${booking.ticketId.type}</td>
</tr>
<tr>
<td style="color:#888;">Quantity</td>
<td>${booking.quantity}</td>
</tr>
<tr>
<td>Status</td>
<td style="color:#2e7d32; font-weight:bold;">CONFIRMED</td>
</tr>
</table>
</td>
</tr>

<tr>
<td align="center" style="padding:20px;">
<img
  src="cid:ticket-qr"
  alt="QR Code"
  style="width:180px; border:1px solid #eee; padding:8px;"
/>
<p style="font-size:12px; color:#666;">
Show this QR code at the entry gate
</p>
</td>
</tr>

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

  // 5️⃣ Send mail with CID attachment (KEY PART)
  await transporter.sendMail({
    from: `"InstaBook" <${process.env.EMAIL_USER}>`,
    to: booking.userId.email,
    subject: "🎟️ Your Event Ticket",
    html: htmlContent,
    attachments: [
      {
        filename: "ticket-qr.png",
        content: qrBuffer,
        cid: "ticket-qr", // MUST match img src
      },
    ],
  });
};

export { sendFreeTicketMail };
