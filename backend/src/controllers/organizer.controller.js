import { User } from "../models/user.model.js";
import { Organizer } from "../models/organizer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { sendOrganizerApplicationMail } from "../utils/sendOrganizerApplicationMail.js";
import {Event} from "../models/event.model.js"
import {Booking } from "../models/booking.model.js"
import mongoose from "mongoose"


 const upgradeToOrganizer = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { organizationName, phone } = req.body;

  if (!organizationName || !phone) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "ORGANIZER") {
  throw new ApiError(400, "User is already an organizer");
  }

  const existingOrganizer = await Organizer.findOne({ userId });
  if (existingOrganizer) {
    throw new ApiError(400, "Organizer application already exists");
  }

  const organizer = await Organizer.create({
    userId,
    organizationName,
    phone,
    organizerStatus: "PENDING"
  });


  // mail is async, non-blocking
  await sendOrganizerApplicationMail(
    user.email,
    user,
    organizationName
  ).catch((err) => {
    console.error("Email failed:", err.message);
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      organizer,
      "Organizer application submitted successfully"
    )
  );
});

const organizerAnalytics = asyncHandler(async (req, res) => {
  const organizerId = req.organizer._id; // ✅ CORRECT

  // 1. Get organizer events
  const events = await Event.find({ organizerId }).select("_id date");

  if (!events.length) {
    return res.status(200).json(
      new ApiResponse(200, {
        totalEvents: 0,
        upcomingEvents: 0,
        totalBookings: 0,
        totalTicketsBooked: 0,
      }, "No analytics data")
    );
  }

  const eventIds = events.map(e => e._id);

  // 2. Total bookings
  const totalBookings = await Booking.countDocuments({
    eventId: { $in: eventIds },
    bookingStatus: "CONFIRMED",
  });

  // 3. Total tickets booked
  const ticketsAgg = await Booking.aggregate([
    {
      $match: {
        eventId: { $in: eventIds },
        bookingStatus: "CONFIRMED",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$quantity" },
      },
    },
  ]);

  // 4. Upcoming events
  const upcomingEvents = events.filter(
    e => new Date(e.date) >= new Date()
  ).length;

  return res.status(200).json(
    new ApiResponse(200, {
      totalEvents: events.length,
      upcomingEvents,
      totalBookings,
      totalTicketsBooked: ticketsAgg[0]?.total || 0,
    }, "Organizer analytics fetched")
  );
});

const eventAnalytics = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const organizerId = req.organizer._id;

  // 1. Validate event
  const event = await Event.findOne({
    _id: eventId,
    organizerId,
  });

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // 2. Total bookings (orders)
  const totalBookings = await Booking.countDocuments({
    eventId,
    bookingStatus: "CONFIRMED",
  });

  // 3. Total tickets booked
  const ticketsAgg = await Booking.aggregate([
    {
      $match: {
        eventId: new mongoose.Types.ObjectId(eventId),
        bookingStatus: "CONFIRMED",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$quantity" },
      },
    },
  ]);

  const ticketsBooked = ticketsAgg[0]?.total || 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        eventTitle: event.title,
        totalBookings,
        ticketsBooked,
        isPublished: event.isPublished,
        eventDate: event.date,
      },
      "Event analytics fetched"
    )
  );
});




export { upgradeToOrganizer , organizerAnalytics , eventAnalytics}
