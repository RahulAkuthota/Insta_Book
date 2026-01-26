import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    organizationName: {
      type: String,
      required: true,
    },

    organizerStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    phone: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    payoutAccountId: {
      type: String, // Razorpay account ID (future use)
    },
  },
  { timestamps: true }
);

export const Organizer = mongoose.model("Organizer", organizerSchema);
