import { Router } from "express"
import { upgradeToOrganizer } from "../controllers/organizer.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"
// import { requireOrganizer } from "../middlewares/role.middlewares.js"




const router=Router()



router.route("/apply")
.post(verifyJWT , upgradeToOrganizer)




export default router