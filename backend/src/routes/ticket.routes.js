import { createTickets } from "../controllers/ticket.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { requireOrganizer } from "../middlewares/role.middlewares.js";


const router = Router();

router
.route("/create/:eventId")
.post(verifyJWT, requireOrganizer, createTickets);

export default router