import Otp from "../models/Otp.js";
import {
  sendOtpService,
  verifyOtpService,
} from "../services/otp.service.js";

/* ================= SEND OTP ================= */
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number",
      });
    }

    const existingOtp = await Otp.findOne({ phone });

    // ⛔ Prevent spam – reuse OTP if valid
    if (existingOtp && existingOtp.expiresAt > new Date()) {
      return res.json({
        message: "OTP already sent",
      });
    }

    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 📲 SEND LIVE OTP
    await sendOtpService(phone, otp);

    await Otp.findOneAndUpdate(
      { phone },
      {
        phone,
        otp,
        expiresAt,
        verified: false,
        resendCount: existingOtp ? existingOtp.resendCount + 1 : 1,
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error.message);
    res.status(500).json({
      message: "OTP service failed",
    });
  }
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        message: "Phone and OTP required",
      });
    }

    const record = await Otp.findOne({ phone });

    if (!record) {
      return res.status(404).json({
        message: "OTP not found",
      });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    // ✅ Verify OTP
    await verifyOtpService(code, record.otp);

    record.verified = true;
    record.expiresAt = new Date(); // invalidate OTP
    await record.save();

    res.json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error.message);
    res.status(400).json({
      message: error.message || "OTP verification failed",
    });
  }
};
