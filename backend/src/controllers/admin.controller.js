import { Organizer } from "../models/organizer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { sendOrganizerRejectedMail } from "../utils/sendOrganizerRejectedMail.js";
import { sendOrganizerApprovedMail } from "../utils/sendOrganizerApprovedMail.js";



const getPendingOrganizers = asyncHandler(async (req, res) => {
  const organizers = await Organizer.find({
    organizerStatus: "PENDING",
  }).populate("userId", "name email");

  if (organizers.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No pending requests"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, organizers, "Pending requests fetched"));
});

const approveOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;

  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  if (organizer.organizerStatus === "APPROVED") {
    throw new ApiError(400, "Organizer already approved");
  }

  const user = await User.findById(organizer.userId);

  if (!user) {
    throw new ApiError(404, "User linked to organizer not found");
  }

  if (organizer.organizerStatus !== "PENDING") {
    throw new ApiError(400, "Organizer request is not pending");
  }

  organizer.organizerStatus = "APPROVED";
  //send approved email
  sendOrganizerApprovedMail(
    user.email,
    user.name,
    organizer.organizationName
  ).catch(console.error);
  
  
  user.role = "ORGANIZER";
  await user.save({ validateBeforeSave: false });
  await organizer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "Organizer approved"));
});


const rejectOrganizer = asyncHandler(async (req, res) => {
  const { organizerId } = req.params;

  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    throw new ApiError(404, "Organizer not found");
  }

  if (organizer.organizerStatus === "REJECTED") {
    throw new ApiError(400, "Organizer already rejected");
  }

  if (organizer.organizerStatus === "APPROVED") {
    throw new ApiError(400, "Organizer already approved");
  }

  const user = await User.findById(organizer.userId)

  organizer.organizerStatus = "REJECTED";
   //send reject mail
   sendOrganizerRejectedMail(
    user.email,
    user.name,
    organizer.organizationName,
    "Incomplete verification documents"
  ).catch(console.error);
  await organizer.save();

  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "Application rejected"));
});


export { getPendingOrganizers, approveOrganizer , rejectOrganizer};
