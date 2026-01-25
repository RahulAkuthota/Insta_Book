import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    paymentProvider: {
      type: String,
      default: "RAZORPAY",
    },

    orderId: {
      type: String,
      required: true,
    },

    paymentId: {
      type: String,
    },

    signature: {
      type: String,
    },

    status: {
      type: String,
      enum: ["CREATED", "SUCCESS", "FAILED"],
      default: "CREATED",
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
