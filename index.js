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

const app = express();

// ✅ CORS ENABLE
app.use(cors());

// Middleware
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// DB
connectDB();

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/loans", loanRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
