import express from "express";
import {
  applyLoan,
  getLoanStatus,
  getAllLoans,
  getLoanDetails,
  approveLoan,
  restartLoan,
} from "../controllers/loanController.js";

import { validateImages } from "../middleware/fileValidation.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= USER ROUTES ================= */

// Apply loan
router.post("/apply", validateImages, applyLoan);

// Get loan status by phone
router.get("/status/:phone", getLoanStatus);

/* ================= ADMIN ROUTES ================= */

// Get all loans (dashboard)
router.get("/admin/loans", adminAuth, getAllLoans);

// Get single loan detail
router.get("/admin/loan/:id", adminAuth, getLoanDetails);

// Approve loan
router.put("/admin/loan/:id/approve", adminAuth, approveLoan);

// Restart loan
router.put("/admin/loan/:id/restart", adminAuth, restartLoan);

export default router;
