import express from "express";
import {
  applyLoan,
  getLoanStatus,
  getAllLoans,
  getLoanDetails,
  approveLoan,
  restartLoan,
  deleteLoan,
} from "../controllers/loanController.js";

import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/* USER */
router.post("/apply", applyLoan);
router.get("/status/:phone", getLoanStatus);

/* ADMIN */
router.get("/admin/loans", adminAuth, getAllLoans);
router.get("/admin/loan/:id", adminAuth, getLoanDetails);
router.put("/admin/loan/:id/approve", adminAuth, approveLoan);
router.put("/admin/loan/:id/restart", adminAuth, restartLoan);
router.delete("/admin/loan/:id", adminAuth, deleteLoan);

export default router;
