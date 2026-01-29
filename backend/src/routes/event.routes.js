import { Router } from "express";
import { createEvent, deleteEvent, updateEvent, getEventById, listOrganizerEvents, publishEvent, unPublishEvent } from "../controllers/event.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { requireOrganizer } from "../middlewares/role.middlewares.js";

const router = Router();

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
.route("/:eventId")
.get(verifyJWT,requireOrganizer,getEventById);

router
.route("/organizer/events")
.get(verifyJWT,requireOrganizer,listOrganizerEvents)

router
.route("/publishevent/:eventId")
.patch(verifyJWT,requireOrganizer,publishEvent)

router
.route("/unpublishevent/:eventId")
.patch(verifyJWT,requireOrganizer,unPublishEvent)


export default router;
