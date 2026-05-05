import express from "express";
import { registerUser, loginUser, checkProfile } from "../controllers/auth.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth, checkProfile);

export default router;
