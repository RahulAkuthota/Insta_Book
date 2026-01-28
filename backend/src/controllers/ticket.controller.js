import { Event } from "../models/event.model.js";
import { Ticket } from "../models/ticket.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const createTickets = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);

  if (!event) {
    throw new ApiError(404, "Event Not Found");
  }

  if (req.organizer._id.toString() !== event.organizerId.toString()) {
    throw new ApiError(404, "Organizer has no access to create tickets");
  }

  if (event.isPublished) {
    throw new ApiError(404, "Cannot create tickets as event already published");
  }

  const { type, price,  totalSeats, availableSeats } = req.body;

  if (
    [type, price, totalSeats, availableSeats].some((field) => !field)
  ) {
    throw new ApiError(404, "All fields are required");
  }

  const isTypeFound = Ticket.findOne({ eventId: event._id, type });

  if (isTypeFound) {
    throw new ApiError(
      400,
      "Tickets of this type already exists for this event",
    );
  }

  let isFree=false;
  if(type==="FREE"){
    isFree=!isFree

  }

  const createdTickets = await Ticket.create({
    eventId: event._id,
    price,
    isFree,
    totalSeats,
    availableSeats,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createTickets, "Tickets created successfully"));
});



export {createTickets}
