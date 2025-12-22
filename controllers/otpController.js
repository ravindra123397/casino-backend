import Otp from "../models/Otp.js";
import {
  generateToken,
  sendOtpService,
  verifyOtpService
} from "../services/messageCentral.service.js";

/* ================= SEND OTP ================= */
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be 10 digits"
      });
    }

    let record = await Otp.findOne({ phone });

    if (record && record.resendCount >= 3) {
      return res.status(429).json({
        message: "OTP resend limit exceeded"
      });
    }

    const authToken = await generateToken();
    const otp = await sendOtpService(authToken, phone);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (!record) {
      await Otp.create({
        phone,
        verificationId: otp.verificationId,
        authToken,
        expiresAt
      });
    } else {
      record.verificationId = otp.verificationId;
      record.authToken = authToken;
      record.expiresAt = expiresAt;
      record.resendCount += 1;
      await record.save();
    }

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("SEND OTP ERROR:", error.response?.data || error.message);
    res.status(500).json({
      message: "OTP service failed"
    });
  }
};

/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        message: "Phone and OTP required"
      });
    }

    const record = await Otp.findOne({ phone });

    if (!record) {
      return res.status(404).json({
        message: "OTP not found"
      });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    const verify = await verifyOtpService(
      record.authToken,
      record.verificationId,
      code
    );

    if (verify.verificationStatus !== "VERIFICATION_COMPLETED") {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    record.verified = true;
    await record.save();

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error.response?.data || error.message);
    res.status(500).json({
      message: "OTP verification failed"
    });
  }
};
