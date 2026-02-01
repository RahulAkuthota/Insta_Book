import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { Ticket } from "../models/ticket.model.js";
import { Event } from "../models/event.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateQRCode } from "../utils/generateQRCode.utils.js"
import { sendFreeTicketMail} from "../utils/sendTicketMail.utils.js"
import Razorpay from "razorpay"
import { Payment } from "../models/payment.model.js"

const createFreeBooking = asyncHandler(async (req, res) => {
  const { ticketId, eventId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(ticketId) ||
      !mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid ID format");
  }

  // Validate quantity
  if (!quantity || quantity <= 0) {
    throw new ApiError(400, "Quantity must be greater than 0");
  }

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  if (!event.isPublished) {
    throw new ApiError(400, "Event not published");
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new ApiError(404, "Ticket not found");

  if (ticket.eventId.toString() !== eventId.toString()) {
    throw new ApiError(400, "Ticket does not belong to this event");
  }

  if (ticket.type !== "FREE" || ticket.price !== 0) {
    throw new ApiError(400, "This is not a free ticket");
  }

  // Atomic seat lock
  const updatedTicket = await Ticket.findOneAndUpdate(
    {
      _id: ticketId,
      availableSeats: { $gte: quantity },
    },
    {
      $inc: { availableSeats: -quantity },
    },
    { new: true }
  );

  if (!updatedTicket) {
    throw new ApiError(400, "Not enough seats available");
  }

  const booking = await Booking.create({
    userId,
    eventId,
    ticketId,
    quantity,
    amount: 0,
    paymentRequired: false,
    bookingStatus: "CONFIRMED",
  });

  const qrUrl = await generateQRCode(booking._id.toString())

  booking.qrCodeUrl=qrUrl;
  await booking.save();

  await sendFreeTicketMail(booking._id.toString())
  .then(data=>console.log("✅ Email sent"))
  .catch(error=>console.error("❌ Error sending email:", error))
  

  return res.status(201).json(
    new ApiResponse(201, booking, "Booking Successful")
  );
});

 

const myBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookings = await Booking.find({ userId })
    .populate("eventId")
    .populate("ticketId")
    .sort({ createdAt: -1 });

  if (!bookings || bookings.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "No bookings found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, bookings, "My bookings fetched successfully")
  );
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaidBooking = asyncHandler(async (req, res) => {
  const { eventId, ticketId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(ticketId) ||
      !mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid ID format");
  }

  if (!quantity || quantity <= 0) {
    throw new ApiError(400, "Invalid quantity");
  }

  const event = await Event.findById(eventId);
  if (!event || !event.isPublished) {
    throw new ApiError(400, "Event not available");
  }

  const ticket = await Ticket.findById(ticketId);
  if (!ticket || ticket.price <= 0) {
    throw new ApiError(400, "Paid ticket required");
  }

  // 🔒 Atomic seat lock
  const updatedTicket = await Ticket.findOneAndUpdate(
    { _id: ticketId, availableSeats: { $gte: quantity } },
    { $inc: { availableSeats: -quantity } },
    { new: true }
  );

  if (!updatedTicket) {
    throw new ApiError(400, "Not enough seats available");
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const booking = await Booking.create({
    userId,
    eventId,
    ticketId,
    quantity,
    amount: ticket.price * quantity,
    paymentRequired: true,
    bookingStatus: "PENDING",
    expiresAt,
  });

  const order = await razorpay.orders.create({
    amount: booking.amount * 100,
    currency: "INR",
    receipt: booking._id.toString(),
  });

  await Payment.create({
    bookingId: booking._id,
    orderId: order.id,
    status: "CREATED",
  });

  return res.status(201).json(
    new ApiResponse(201, {
      bookingId: booking._id,
      orderId: order.id,
      amount: booking.amount,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    })
  );
});



export { createFreeBooking,myBookings,createPaidBooking };
