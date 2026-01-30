import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  getEventById,
  listOrganizerEvents,
  getTickets,
  publishEvent,
  unPublishEvent,
  getPublishedEvents,
  getPublishedEventTickets,
} from "../controllers/event.controller.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { requireOrganizer } from "../middlewares/role.middlewares.js";

const router = Router();

/* ================= PUBLIC ROUTES ================= */

// all published events
router
  .route("/")
  .get(getPublishedEvents);

// published event tickets
router
  .route("/:eventId/tickets")
  .get(getPublishedEventTickets);

// single published event
router
  .route("/:eventId")
  .get(getEventById);

/* ================= ORGANIZER ROUTES ================= */

router
  .route("/create")
  .post(verifyJWT, requireOrganizer, createEvent);

router
  .route("/update/:eventId")
  .patch(verifyJWT, requireOrganizer, updateEvent);

router
  .route("/delete/:eventId")
  .delete(verifyJWT, requireOrganizer, deleteEvent);

router
  .route("/organizer/events")
  .get(verifyJWT, requireOrganizer, listOrganizerEvents);

router
  .route("/organizer/events/:eventId/tickets")
  .get(verifyJWT, requireOrganizer, getTickets);

router
  .route("/publishevent/:eventId")
  .patch(verifyJWT, requireOrganizer, publishEvent);

router
  .route("/unpublishevent/:eventId")
  .patch(verifyJWT, requireOrganizer, unPublishEvent);

export default router;
