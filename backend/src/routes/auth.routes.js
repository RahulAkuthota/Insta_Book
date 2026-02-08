import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {getCurrentUser, loginUser, logoutUser ,registerUser} from "../controllers/auth.controller.js"



const router=Router()


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT , getCurrentUser)



export default router