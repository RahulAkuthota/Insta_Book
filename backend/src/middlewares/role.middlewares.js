import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Organizer } from "../models/organizer.model.js";

const requireOrganizer = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Login required");
  }

  if (req.user.role !== "ORGANIZER") {
    throw new ApiError(403, "Organizer access required");
  }

  const organizer = await Organizer.findOne({ userId: req.user._id });

  if (!organizer) {
    throw new ApiError(403, "Organizer profile not found");
  }

  if (organizer.organizerStatus !== "APPROVED") {
  throw new ApiError(403, "Organizer not approved");
  } 

  req.organizer = organizer;
  next();
});



const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Login required");
  }

  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Admin access required");
  }

  next();
});


export { requireOrganizer , requireAdmin };
