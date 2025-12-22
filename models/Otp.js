import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: String,
  verificationId: String,
  authToken: String,
  expiresAt: Date,
  resendCount: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Otp", otpSchema);
