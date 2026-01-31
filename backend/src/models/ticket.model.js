import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    type: {
      type: String,
      enum: ["FREE", "GENERAL", "PLATINUM"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0, // FREE → 0
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

// Only one ticket type per event
ticketSchema.index({ eventId: 1, type: 1 }, { unique: true });

export const Ticket = mongoose.model("Ticket", ticketSchema);
