import mongoose from "mongoose";
import { Organizer } from "../models/organizer.model.js";
import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
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

/* ================= ADMIN EVENTS LIST ================= */

const getAdminEvents = asyncHandler(async (req, res) => {
  const { filter = "active" } = req.query;
  const normalizedFilter = String(filter).toLowerCase();

  const events = await Event.find()
    .populate({
      path: "organizerId",
      select: "organizationName phone userId organizerStatus",
      populate: {
        path: "userId",
        select: "name email",
      },
    })
    .sort({ date: 1, startTime: 1 });

  const now = new Date();

  const withMeta = events.map((eventDoc) => {
    const event = eventDoc.toObject();
    const datePart = event?.date
      ? new Date(event.date).toISOString().split("T")[0]
      : null;
    const startTime = event?.startTime || "00:00";
    const eventDateTime = datePart ? new Date(`${datePart}T${startTime}:00`) : null;
    const isExpired = eventDateTime ? eventDateTime < now : false;
    const isActive = event.isPublished && !isExpired;

    return {
      ...event,
      isExpired,
      isActive,
    };
  });

  const filtered = withMeta.filter((event) => {
    if (normalizedFilter === "active") return event.isActive;
    if (normalizedFilter === "expired") return event.isExpired;
    if (normalizedFilter === "published") return event.isPublished;
    if (normalizedFilter === "unpublished") return !event.isPublished;
    return true;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, filtered, "Admin events fetched successfully"));
});

export {
  getPendingOrganizers,
  approveOrganizer,
  rejectOrganizer,
  getAdminEvents,
};
