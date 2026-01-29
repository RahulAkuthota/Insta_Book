import { Event } from "../models/event.model.js";
import { Ticket } from "../models/ticket.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/* ================= CREATE TICKET ================= */

const createTicket = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { type, price, totalSeats } = req.body;

  //  Validate event
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  //  Organizer ownership check
  if (event.organizerId.toString() !== req.organizer._id.toString()) {
    throw new ApiError(403, "Organizer has no access to create tickets");
  }

  //  Published event check
  if (event.isPublished) {
    throw new ApiError(400, "Cannot create tickets after event is published");
  }

  // Input validation
  if (!type || !totalSeats) {
    throw new ApiError(400, "Ticket type and total seats are required");
  }

  if (totalSeats <= 0) {
    throw new ApiError(400, "Total seats must be greater than zero");
  }

  //  Normalize ticket type
  const ticketType = type.toUpperCase();
  const isFree = ticketType === "FREE";

  if (isFree && price > 0) {
    throw new ApiError(400, "Free tickets cannot have price");
  }

  if (!isFree && price <= 0) {
    throw new ApiError(400, "Paid tickets must have price greater than zero");
  }

  //  Prevent duplicate ticket types
  const existingTicket = await Ticket.findOne({
    eventId: event._id,
    type: ticketType,
  });

  if (existingTicket) {
    throw new ApiError(
      400,
      "Ticket of this type already exists for this event",
    );
  }

  //  Create ticket
  const ticket = await Ticket.create({
    eventId: event._id,
    type: ticketType,
    price: isFree ? 0 : price,
    isFree,
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

  //  Validate ticket
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "Invalid ticket");
  }

  //  Validate event
  const event = await Event.findById(ticket.eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Organizer ownership check
  if (event.organizerId.toString() !== req.organizer._id.toString()) {
    throw new ApiError(
      403,
      "Unauthorized request. You don't have permission to delete this ticket",
    );
  }

  //  Prevent deletion after publish
  if (event.isPublished) {
    throw new ApiError(400, "Cannot delete tickets after event is published");
  }

  //  Delete ticket
  await ticket.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Ticket deleted successfully"));
});

export { createTicket, deleteTicket };
