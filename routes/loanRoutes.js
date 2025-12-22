import express from "express";
import { applyLoan, approveLoan } from "../controllers/loanController.js";
import { validateImages } from "../middleware/fileValidation.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();
router.post("/apply", validateImages, applyLoan);
router.put("/approve/:id", adminAuth, approveLoan);
export default router;
