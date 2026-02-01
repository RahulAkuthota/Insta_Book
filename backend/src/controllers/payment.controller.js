import crypto from "crypto";
import Razorpay from "razorpay";
import { Booking } from "../models/booking.model.js";
import { Payment } from "../models/payment.model.js";
import { Ticket } from "../models/ticket.model.js";
import { generateQRCode } from "../utils/generateQRCode.utils.js";
import { sendPaidTicketEmail } from "../utils/sendPaidTicketEmail.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const verifyPayment = asyncHandler(async (req, res) => {
  const {
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking || booking.bookingStatus !== "PENDING") {
    throw new ApiError(400, "Invalid or already processed booking");
  }

  const payment = await Payment.findOne({ bookingId });
  if (!payment) {
    throw new ApiError(404, "Payment record not found");
  }

  // 1️⃣ Signature verification
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    payment.status = "FAILED";
    await payment.save();

    // release seats
    await Ticket.findByIdAndUpdate(booking.ticketId, {
      $inc: { availableSeats: booking.quantity },
    });

    booking.bookingStatus = "FAILED";
    await booking.save();

    throw new ApiError(400, "Payment verification failed");
  }

  // 2️⃣ Expiry check (REFUND ZONE)
  if (booking.expiresAt < new Date()) {
    await razorpay.payments.refund(razorpay_payment_id);

    payment.status = "FAILED";
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    await payment.save();

    await Ticket.findByIdAndUpdate(booking.ticketId, {
      $inc: { availableSeats: booking.quantity },
    });

    booking.bookingStatus = "EXPIRED";
    await booking.save();

    throw new ApiError(400, "Booking expired, amount refunded");
  }

  // 3️⃣ SUCCESS
  booking.bookingStatus = "CONFIRMED";
  booking.expiresAt = null;

  const qr = await generateQRCode(booking._id.toString());
  booking.qrCodeUrl = qr;
  await booking.save();

  payment.status = "SUCCESS";
  payment.paymentId = razorpay_payment_id;
  payment.signature = razorpay_signature;
  await payment.save();

  // non‑blocking
  sendPaidTicketEmail(booking._id).catch(() => {});

  return res.status(200).json(
    new ApiResponse(200, booking, "Payment successful & booking confirmed")
  );
});

export { verifyPayment };
