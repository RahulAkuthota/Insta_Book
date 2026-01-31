import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    amount: {
      type: Number,
      min: 0,
      required: true, // 👈 always present (0 for free)
    },

    paymentRequired: {
      type: Boolean,
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "FAILED", "CANCELLED", "EXPIRED"],
      default: "PENDING",
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: function () {
        return this.paymentRequired;
      },
    },

    qrCodeUrl: {
      type: String,
      // // required: function () {
      // //   return this.bookingStatus === "CONFIRMED";
      // },
    },
  },
  { timestamps: true },
);

export const Booking = mongoose.model("Booking", bookingSchema);
