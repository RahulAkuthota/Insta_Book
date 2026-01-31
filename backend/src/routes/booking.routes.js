import { Router } from "express"
import { freeBooking } from "../controllers/booking.controller.js"

const router=Router()




router.route("/book/:eventId/:ticketId")
.post(verifyJWT , freeBooking)



export default router