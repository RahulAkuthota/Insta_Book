import { User } from "../models/user.model.js";
import { Organizer } from "../models/organizer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { sendOrganizerApplicationMail } from "../utils/sendOrganizerApplicationMail.js";


 const upgradeToOrganizer = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { organizationName, phone } = req.body;

  if (!organizationName || !phone) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "ORGANIZER") {
  throw new ApiError(400, "User is already an organizer");
  }

  const existingOrganizer = await Organizer.findOne({ userId });
  if (existingOrganizer) {
    throw new ApiError(400, "Organizer application already exists");
  }

  const organizer = await Organizer.create({
    userId,
    organizationName,
    phone,
    organizerStatus: "PENDING"
  });


  // mail is async, non-blocking
  sendOrganizerApplicationMail(
    user.email,
    user,
    organizationName
  ).catch((err) => {
    console.error("Email failed:", err.message);
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      organizer,
      "Organizer application submitted successfully"
    )
  );
});



export { upgradeToOrganizer }
