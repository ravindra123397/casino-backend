import axios from "axios";

/* ================= SEND OTP (FAST2SMS LIVE) ================= */
export const sendOtpService = async (phone, otp) => {
  try {
    const res = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        route: "q", // transactional
        numbers: phone,
        message: `${otp} is your one time password (OTP) for user authentication from sawariya fin Pvt`,
      },
      headers: {
        "cache-control": "no-cache",
      },
    });

    if (!res.data || res.data.return !== true) {
      throw new Error(res.data?.message || "Fast2SMS SMS failed");
    }

    return true;
  } catch (error) {
    console.error(
      "❌ FAST2SMS OTP ERROR:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/* ================= VERIFY OTP (LOCAL CHECK) ================= */
export const verifyOtpService = async (inputOtp, storedOtp) => {
  if (!storedOtp) {
    throw new Error("OTP not generated");
  }

  if (String(inputOtp) !== String(storedOtp)) {
    throw new Error("Invalid OTP");
  }

  return true;
};
