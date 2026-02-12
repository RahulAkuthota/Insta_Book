import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Booking } from "../models/booking.model.js";
import { Ticket } from "../models/ticket.model.js";
import { Event } from "../models/event.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateQRCode } from "../utils/generateQRCode.utils.js";
import { sendFreeTicketMail } from "../utils/sendTicketMail.utils.js";
import Razorpay from "razorpay";
import { Payment } from "../models/payment.model.js";

const MAX_FREE_TICKETS_PER_USER = 5;

const extractBookingIdFromQr = (rawQrData) => {
  if (!rawQrData || typeof rawQrData !== "string") {
    return null;
  }

  const trimmed = rawQrData.trim();
  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed?.bookingId && mongoose.Types.ObjectId.isValid(parsed.bookingId)) {
      return parsed.bookingId;
    }
  } catch {}

  return null;
};

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

  // ✅ Allow multiple free bookings, but cap total quantity per user per event/ticket.
  const userFreeBookings = await Booking.find({
    userId,
    eventId,
    ticketId,
    bookingStatus: "CONFIRMED",
  }).select("quantity");

  const alreadyBookedQty = userFreeBookings.reduce(
    (sum, booking) => sum + Number(booking.quantity || 0),
    0
  );

  if (alreadyBookedQty + quantity > MAX_FREE_TICKETS_PER_USER) {
    const remaining = Math.max(0, MAX_FREE_TICKETS_PER_USER - alreadyBookedQty);
    throw new ApiError(
      400,
      remaining > 0
        ? `Free ticket limit is ${MAX_FREE_TICKETS_PER_USER}. You can book only ${remaining} more.`
        : `Free ticket limit of ${MAX_FREE_TICKETS_PER_USER} reached for this event.`
    );
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

  const qrUrl = await generateQRCode(booking._id.toString());

  booking.qrCodeUrl = qrUrl;
  await booking.save();

  await sendFreeTicketMail(booking._id.toString())
    .then(() => console.log("✅ Email sent"))
    .catch((error) => console.error("❌ Error sending email:", error));

  return res.status(201).json(
    new ApiResponse(201, booking, "Booking Successful")
  );
});

const myBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookings = await Booking.find({ userId, bookingStatus: "CONFIRMED" })
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

const scanOrganizerBooking = asyncHandler(async (req, res) => {
  const { qrData } = req.body;
  const organizerId = req.organizer._id;

  const bookingId = extractBookingIdFromQr(qrData);
  if (!bookingId) {
    throw new ApiError(400, "Invalid QR code");
  }

  const booking = await Booking.findById(bookingId)
    .populate("userId", "name email")
    .populate("ticketId", "type price")
    .populate("eventId", "title date startTime location organizerId");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (!booking.eventId || booking.eventId.organizerId.toString() !== organizerId.toString()) {
    throw new ApiError(403, "You are not allowed to scan this ticket");
  }

  if (!booking.checkInStatus) {
    booking.checkInStatus = "NOT_USED";
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking scanned successfully"));
});

const markBookingUsed = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const organizerId = req.organizer._id;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid booking ID");
  }

  const existing = await Booking.findById(bookingId).populate(
    "eventId",
    "organizerId"
  );

  if (!existing) {
    throw new ApiError(404, "Booking not found");
  }

  if (
    !existing.eventId ||
    existing.eventId.organizerId.toString() !== organizerId.toString()
  ) {
    throw new ApiError(403, "You are not allowed to update this booking");
  }

  const updated = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      bookingStatus: "CONFIRMED",
      $or: [{ checkInStatus: "NOT_USED" }, { checkInStatus: { $exists: false } }],
    },
    {
      $set: {
        checkInStatus: "USED",
        checkedInAt: new Date(),
        checkedInBy: req.user._id,
      },
    },
    { new: true }
  )
    .populate("userId", "name email")
    .populate("ticketId", "type price")
    .populate("eventId", "title date startTime location organizerId");

  if (!updated) {
    if (existing.checkInStatus === "USED") {
      throw new ApiError(409, "Ticket already marked as used");
    }
    throw new ApiError(400, "Only confirmed tickets can be marked as used");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Ticket marked as used"));
});

const organizerBookings = asyncHandler(async (req, res) => {
  const organizerId = req.organizer._id;
  const { eventId, checkInStatus } = req.query;

  let eventIds = [];

  if (eventId) {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid event ID");
    }

    const event = await Event.findOne({ _id: eventId, organizerId }).select("_id");
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    eventIds = [event._id];
  } else {
    const events = await Event.find({ organizerId }).select("_id");
    eventIds = events.map((event) => event._id);
  }

  if (eventIds.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No organizer bookings found"));
  }

  const filter = {
    eventId: { $in: eventIds },
    bookingStatus: "CONFIRMED",
  };

  if (checkInStatus) {
    if (!["NOT_USED", "USED"].includes(checkInStatus)) {
      throw new ApiError(400, "Invalid check-in status");
    }
    if (checkInStatus === "NOT_USED") {
      filter.$or = [{ checkInStatus: "NOT_USED" }, { checkInStatus: { $exists: false } }];
    } else {
      filter.checkInStatus = "USED";
    }
  }

  const bookings = await Booking.find(filter)
    .populate("userId", "name email")
    .populate("ticketId", "type price")
    .populate("eventId", "title date startTime location")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Organizer bookings fetched successfully"));
});

export {
  createFreeBooking,
  myBookings,
  createPaidBooking,
  scanOrganizerBooking,
  markBookingUsed,
  organizerBookings,
};
