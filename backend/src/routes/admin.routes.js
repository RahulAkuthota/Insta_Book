import express from "express";
import {verifyJWT} from "../middlewares/auth.middlewares.js";
import {requireAdmin} from "../middlewares/role.middlewares.js";
import { getPendingOrganizers, approveOrganizer } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/organizers/pending",
    verifyJWT,
    requireAdmin,
    getPendingOrganizers);

router.patch("/organizers/:organizerId/approve",
    verifyJWT,
    requireAdmin,
    approveOrganizer);

export default router;
