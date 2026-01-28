import { Router } from "express";
import { createEvent, deleteEvent, updateEvent } from "../controllers/event.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { requireOrganizer } from "../middlewares/role.middlewares.js";

const router = Router();

router
.route("/create")
.post(verifyJWT, requireOrganizer, createEvent);

router
.route("/update/:eventId")
.post(verifyJWT, requireOrganizer, updateEvent);

router
.route("/delete/:eventId")
.post(verifyJWT, requireOrganizer, deleteEvent);


export default router;
