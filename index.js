// 🔴 MUST BE FIRST
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js";
const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
  limits: { fileSize: 10 * 1024 * 1024 }, // ✅ 10 MB
  abortOnLimit: true,
}));


/* ===============================
   DATABASE
================================ */
connectDB();

/* ===============================
   ✅ ROOT PATH ROUTE
   GET /
================================ */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Loan API is running successfully",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
});

/* ===============================
   PUBLIC ROUTES
================================ */
app.use("/api/otp", otpRoutes);

/* ===============================
   PROTECTED ROUTES
================================ */
app.use("/api/admin", adminRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/user", userProfileRoutes);

/* ===============================
   404 HANDLER
================================ */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "❌ Route not found",
  });
});

/* ===============================
   SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
