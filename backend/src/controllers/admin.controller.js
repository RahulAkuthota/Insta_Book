import mongoose from "mongoose";
import { Organizer } from "../models/organizer.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { sendOrganizerRejectedMail } from "../utils/sendOrganizerRejectedMail.js";
import { sendOrganizerApprovedMail } from "../utils/sendOrganizerApprovedMail.js";

/* ================= GET PENDING ORGANIZERS ================= */

const getPendingOrganizers = asyncHandler(async (req, res) => {
  const organizers = await Organizer.find({
    organizerStatus: "PENDING",
  }).populate("userId", "name email");

  return res.status(200).json(
    new ApiResponse(200, organizers, "Pending requests fetched")
  );
});

/* ================= APPROVE ORGANIZER ================= */

const approveOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(organizerId)) {
    throw new ApiError(400, "Invalid Organizer ID");
  }

  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  if (organizer.organizerStatus === "APPROVED") {
    throw new ApiError(400, "Organizer already approved");
  }

  if (organizer.organizerStatus !== "PENDING") {
    throw new ApiError(400, "Organizer request is not pending");
  }

  const user = await User.findById(organizer.userId);
  if (!user) {
    throw new ApiError(404, "User linked to organizer not found");
  }

  // 🔒 Update DB first
  organizer.organizerStatus = "APPROVED";
  user.role = "ORGANIZER";

  await Promise.all([
    organizer.save(),
    user.save({ validateBeforeSave: false }),
  ]);

  // 📧 Send mail AFTER DB success
  sendOrganizerApprovedMail(
    user.email,
    user.name,
    organizer.organizationName
  ).catch(console.error);

  return res.status(200).json(
    new ApiResponse(200, organizer, "Organizer approved successfully")
  );
});

/* ================= REJECT ORGANIZER ================= */

const rejectOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(organizerId)) {
    throw new ApiError(400, "Invalid Organizer ID");
  }

  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  if (organizer.organizerStatus === "REJECTED") {
    throw new ApiError(400, "Organizer already rejected");
  }

  if (organizer.organizerStatus === "APPROVED") {
    throw new ApiError(400, "Approved organizer cannot be rejected");
  }

  const user = await User.findById(organizer.userId);
  if (!user) {
    throw new ApiError(404, "User linked to organizer not found");
  }

  organizer.organizerStatus = "REJECTED";
  await organizer.save();

  // 📧 Send mail AFTER DB success
  sendOrganizerRejectedMail(
    user.email,
    user.name,
    organizer.organizationName,
    "Incomplete verification documents"
  ).catch(console.error);

  return res.status(200).json(
    new ApiResponse(200, organizer, "Organizer application rejected")
  );
});

export {
  getPendingOrganizers,
  approveOrganizer,
  rejectOrganizer,
};
