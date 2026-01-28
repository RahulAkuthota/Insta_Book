import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    type: {
      type: String, // Regular / VIP / Free
      required: true,
      enum:["GENERAL","PLATINUM","FREE"]
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    totalSeats: {
      type: Number,
      required: true,
    },

    availableSeats: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
