import express from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { requireAdmin } from "../middlewares/role.middlewares.js";
import {
  getPendingOrganizers,
  approveOrganizer,
  rejectOrganizer,
  getAdminEvents,
} from "../controllers/admin.controller.js";

const router = express.Router();

   router
  .route("/organizers/pending")
  .get(verifyJWT, requireAdmin, getPendingOrganizers);

   router
  .route("/organizers/:organizerId/approve")
  .patch(verifyJWT, requireAdmin, approveOrganizer);

  router.route("/organizers/:organizerId/reject")
  .patch(verifyJWT , requireAdmin , rejectOrganizer)

  router
  .route("/events")
  .get(verifyJWT, requireAdmin, getAdminEvents);

export default router;
