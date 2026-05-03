import { Router } from "express";
import { signIn, signUp } from "../controllers/auth.controller.js";

const router = Router();

router.post("/sign-up",signUp);
router.post("/sign-in",signIn);
// router.post("/signout",signOut);

export default router;