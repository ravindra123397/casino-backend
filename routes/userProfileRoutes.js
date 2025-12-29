import express from "express";
import { getUserProfile } from "../controllers/userProfileController.js";

const router = express.Router();

/* ================= USER PROFILE ================= */
// GET /api/user/profile/:phone
router.get("/profile/:phone", getUserProfile);

export default router;
