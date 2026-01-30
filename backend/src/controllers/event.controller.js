import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import { Ticket } from "../models/ticket.model.js";
import mongoose from "mongoose";

/* ================= CREATE EVENT ================= */

const createEvent = asyncHandler(async (req, res) => {
  const { title, description, category, date, location, startTime } = req.body;

  if (!title || !description || !category || !date || !location || !startTime) {
    throw new ApiError(400, "All fields are mandatory");
  }

  const organizer = req.organizer;
  if (!organizer) {
    throw new ApiError(401, "Organizer not found");
  }

  const existingEvent = await Event.findOne({
    organizerId: organizer._id,
    title,
    description,
    category,
    date,
    location,
    startTime,
  });

  if (existingEvent) {
    throw new ApiError(409, "Event already exists");
  }

  const createdEvent = await Event.create({
    organizerId: organizer._id,
    title,
    description,
    category,
    date,
    startTime,
    location,
    isPublished: false,
  });

  return res.status(201).json(
    new ApiResponse(201, createdEvent, "Event created successfully")
  );
});

/* ================= UPDATE EVENT ================= */

const updateEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid Event ID format");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.organizerId.toString() !== req.organizer._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this event");
  }

  // 🔒 No updates after publish
  if (event.isPublished) {
    throw new ApiError(400, "Cannot update event after publishing");
  }

  const { title, description, category, date, location, startTime } = req.body;

  if (title) event.title = title;
  if (description) event.description = description;
  if (category) event.category = category;
  if (date) event.date = date;
  if (location) event.location = location;
  if (startTime) event.startTime = startTime;

  const duplicateEvent = await Event.findOne({
    organizerId: req.organizer._id,
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date,
    location: event.location,
    startTime: event.startTime,
    _id: { $ne: eventId },
  });

  if (duplicateEvent) {
    throw new ApiError(409, "Event already exists with same details");
  }

  await event.save();

  return res.status(200).json(
    new ApiResponse(200, event, "Event updated successfully")
  );
});

/* ================= DELETE EVENT ================= */

const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid Event ID format");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (req.organizer._id.toString() !== event.organizerId.toString()) {
    throw new ApiError(403, "Organizer access needed");
  }

  if (event.isPublished) {
    throw new ApiError(400, "Cannot delete a published event");
  }

  const ticketExists = await Ticket.exists({ eventId });
  if (ticketExists) {
    throw new ApiError(400, "Delete tickets before deleting event");
  }

  await event.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Event deleted successfully")
  );
});

/* ================= GET EVENT BY ID ================= */

const getEventById = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid Event ID format");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (req.organizer._id.toString() !== event.organizerId.toString()) {
    throw new ApiError(403, "Organizer access needed");
  }

  return res.status(200).json(
    new ApiResponse(200, event, "Event fetched successfully")
  );
});

/* ================= LIST ORGANIZER EVENTS ================= */

const listOrganizerEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    organizerId: req.organizer._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, events, "Organized events fetched successfully")
  );
});

/* ================= GET EVENT TICKETS (ORGANIZER) ================= */

const getTickets = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid Event ID format");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (req.organizer._id.toString() !== event.organizerId.toString()) {
    throw new ApiError(403, "Organizer access needed");
  }

  const tickets = await Ticket.find({ eventId });

  return res.status(200).json(
    new ApiResponse(200, tickets, "Tickets fetched successfully")
  );
});

/* ================= PUBLISH EVENT ================= */

const publishEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid Event ID");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (req.organizer._id.toString() !== event.organizerId.toString()) {
    throw new ApiError(403, "Unauthorized access");
  }

  if (event.isPublished) {
    throw new ApiError(400, "Event already published");
  }

  const ticketCount = await Ticket.countDocuments({ eventId });
  if (ticketCount === 0) {
    throw new ApiError(400, "Cannot publish event without tickets");
  }

  event.isPublished = true;
  await event.save();

  return res.status(200).json(
    new ApiResponse(200, event, "Event published successfully")
  );
});

/* ================= UNPUBLISH EVENT ================= */

const unPublishEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid Event ID");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (req.organizer._id.toString() !== event.organizerId.toString()) {
    throw new ApiError(403, "Unauthorized access");
  }

  if (!event.isPublished) {
    throw new ApiError(400, "Event is not published");
  }

  event.isPublished = false;
  await event.save();

  return res.status(200).json(
    new ApiResponse(200, event, "Event unpublished successfully")
  );
});

/* ================= PUBLIC APIs ================= */

const getPublishedEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isPublished: true });

  return res.status(200).json(
    new ApiResponse(200, events, "Published events fetched successfully")
  );
});

const getPublishedEventTickets = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, "Invalid Event ID format");
  }

  const event = await Event.findOne({
    _id: eventId,
    isPublished: true,
  });

  if (!event) {
    throw new ApiError(404, "Event not found or not published");
  }

  const tickets = await Ticket.find({
    eventId,
    availableSeats: { $gt: 0 },
  });

  return res.status(200).json(
    new ApiResponse(200, tickets, "Tickets fetched successfully")
  );
});

export {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  listOrganizerEvents,
  getTickets,
  publishEvent,
  unPublishEvent,
  getPublishedEvents,
  getPublishedEventTickets,
};
