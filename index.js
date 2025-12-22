// 🔴 MUST BE FIRST LINE
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import fileUpload from "express-fileupload";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";


connectDB();

const app = express();
app.use(express.json());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

app.use("/api/admin", adminRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/loans", loanRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
