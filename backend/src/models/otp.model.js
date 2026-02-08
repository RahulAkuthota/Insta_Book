import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["EMAIL_VERIFY", "PASSWORD_RESET"],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
},
{ timestamps: true }
);

// 🔥 Auto delete after expiry
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp= mongoose.model("Otp", otpSchema);
