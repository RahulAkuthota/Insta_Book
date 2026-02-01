import { verifyJWT } from "../middlewares/auth.middlewares.js"
import {Router} from "express"
import { verifyPayment} from "../controllers/payment.controller.js"



const router=Router();



router.route("/verify")
.post(verifyJWT , verifyPayment)


export default router