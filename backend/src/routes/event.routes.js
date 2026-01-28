import { Router } from "express";
import { createEvent, deleteEvent, updateEvent, getEventById, listOrganizerEvents } from "../controllers/event.controller.js";
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


export default router;
