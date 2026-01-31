import nodemailer from "nodemailer";
import { Booking } from "../models/booking.model.js";
import { ApiError } from "./ApiError.js";

/**
 * Call this function AFTER booking is CONFIRMED and QR is generated
 * @param {ObjectId} bookingId
 */
export const sendTicketEmail = async (bookingId) => {
  // Fetch booking with all details
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

  //  Create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // Email HTML (INLINE TEMPLATE)
  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0; padding:0; background:#f2f2f2;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;">
        <tr>
          <td align="center" style="padding:20px;">
  
            <!-- Ticket Card -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="max-width:600px; background:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#222; border-radius:6px; overflow:hidden;">
  
              <!-- Header -->
              <tr>
                <td style="background:green; padding:16px 24px; color:#ffffff;">
                  <h2 style="margin:0; font-size:18px;">Booking Confirmed</h2>
                  <p style="margin:4px 0 0; font-size:13px;">
                    Booking ID: <strong>${booking._id}</strong>
                  </p>
                </td>
              </tr>
  
              <!-- Greeting -->
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 6px; font-size:14px;">
                    Hi <strong>${booking.userId.name}</strong>,
                  </p>
                  <p style="margin:0; font-size:14px; color:#555;">
                    Your booking is confirmed. Please show this ticket at the venue.
                  </p>
                </td>
              </tr>
  
              <!-- Event Details -->
              <tr>
                <td style="padding:0 24px 12px;">
                  <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
                    <tr>
                      <td style="color:#888; width:35%;">Event</td>
                      <td><strong>${booking.eventId.title}</strong></td>
                    </tr>
                    <tr>
                      <td style="color:#888;">Date</td>
                      <td>${booking.eventId.date}</td>
                    </tr>
                    <tr>
                      <td style="color:#888;">Venue</td>
                      <td>${booking.eventId.venue}</td>
                    </tr>
                  </table>
                </td>
              </tr>
  
              <!-- Divider -->
              <tr>
                <td style="padding:0 24px;">
                  <hr style="border:none; border-top:1px dashed #ddd;" />
                </td>
              </tr>
  
              <!-- Ticket Details -->
              <tr>
                <td style="padding:12px 24px;">
                  <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
                    <tr>
                      <td style="color:#888; width:35%;">Ticket Type</td>
                      <td>${booking.ticketId.type}</td>
                    </tr>
                    <tr>
                      <td style="color:#888;">Quantity</td>
                      <td>${booking.quantity}</td>
                    </tr>
                    <tr>
                    <td style="color:#777;">Status</td>
                    <td style="color:#2e7d32; font-weight:bold;">CONFIRMED</td>
                  </tr>
                  </table>
                </td>
              </tr>
  
              <!-- QR Code -->
              <tr>
                <td align="center" style="padding:18px 24px;">
                  <img src="${booking.qrCodeUrl}"
                       alt="QR Code"
                       style="width:180px; max-width:100%; height:auto; border:1px solid #eee; padding:8px;" />
                  <p style="margin:8px 0 0; font-size:12px; color:#666;">
                    Show this QR code at the entry gate
                  </p>
                </td>
              </tr>
  
              <!-- Footer -->
              <tr>
                <td style="padding:14px 24px; background:#fafafa; font-size:12px; color:#777; text-align:center;">
                  This is a system-generated ticket. Please carry a valid ID proof if required.<br/>
                  <strong>InstaBook</strong>
                </td>
              </tr>
  
            </table>
            <!-- End Ticket Card -->
  
          </td>
        </tr>
      </table>
    </body>
  </html>
  
  `;

  //  Send email
  await transporter.sendMail({
    from: `"InstaBook" <${process.env.MAIL_USER}>`,
    to: booking.userId.email,
    subject: "🎟️ Your Event Ticket",
    html: htmlContent,
  });
};
