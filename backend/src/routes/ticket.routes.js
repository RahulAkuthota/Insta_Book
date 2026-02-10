import { createTicket, deleteTicket } from "../controllers/ticket.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { requireOrganizer } from "../middlewares/role.middlewares.js";
import { getTicketAnalytics } from "../controllers/ticket.controller.js";


const router = Router();

router
.route("/create/:eventId")
.post(verifyJWT, requireOrganizer, createTicket);

router
.route("/delete/:ticketId")
.delete(verifyJWT, requireOrganizer, deleteTicket);

router
.route("/events/:eventId/ticketanalytics")
.delete(verifyJWT, requireOrganizer, getTicketAnalytics);

export default router