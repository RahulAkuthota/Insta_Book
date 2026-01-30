import { Event } from "../models/event.model.js";
import { Ticket } from "../models/ticket.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/* ================= CREATE TICKET ================= */
const createTicket = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { type, price, totalSeats } = req.body;

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, "Event not found");

  if (event.organizerId.toString() !== req.organizer._id.toString()) {
    throw new ApiError(403, "Organizer has no access");
  }

  if (event.isPublished) {
    throw new ApiError(400, "Cannot create tickets after publish");
  }

  if (!type || price == null || totalSeats == null) {
    throw new ApiError(400, "Type, price and totalSeats are required");
  }

  if (totalSeats <= 0) {
    throw new ApiError(400, "Total seats must be greater than zero");
  }

  if (price < 0) {
    throw new ApiError(400, "Price cannot be negative");
  }

  const ticketType = type.toUpperCase();

  const existingTicket = await Ticket.findOne({
    eventId,
    type: ticketType,
  });

  if (existingTicket) {
    throw new ApiError(400, "Ticket type already exists for this event");
  }

  const ticket = await Ticket.create({
    eventId,
    type: ticketType,
    price, // 0 = free, >0 = paid
    totalSeats,
    availableSeats: totalSeats,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, ticket, "Ticket created successfully"));
});


/* ================= DELETE TICKET ================= */

const deleteTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId);
  if (!ticket) throw new ApiError(404, "Ticket not found");

  const event = await Event.findById(ticket.eventId);
  if (!event) throw new ApiError(404, "Event not found");

  if (event.organizerId.toString() !== req.organizer._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (event.isPublished) {
    throw new ApiError(400, "Cannot delete tickets after publish");
  }

  const bookingExists = await Booking.exists({ ticketId });
  if (bookingExists) {
    throw new ApiError(400, "Cannot delete ticket with bookings");
  }

  await ticket.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Ticket deleted successfully"));
});


export { createTicket, deleteTicket };
