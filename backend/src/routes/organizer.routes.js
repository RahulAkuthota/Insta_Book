import { Router } from "express"
import { upgradeToOrganizer , organizerAnalytics} from "../controllers/organizer.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { requireOrganizer } from "../middlewares/role.middlewares.js"
import { eventAnalytics } from "../controllers/organizer.controller.js"



const router=Router()



router.route("/apply")
.post(verifyJWT , upgradeToOrganizer)

router.route("/analytics")
.get(verifyJWT , requireOrganizer , organizerAnalytics)

router.route("/events/:eventId/analytics")
.get(verifyJWT , requireOrganizer , eventAnalytics)

export default router