import axios from "axios";

/* ================= BASE URL ================= */
const BASE_URL = process.env.MESSAGE_CENTRAL_BASE_URL.replace(/\/$/, "");

/* ================= GENERATE TOKEN ================= */
export const generateToken = async () => {
  console.log("🔐 Generating MessageCentral token...");

  const body = new URLSearchParams({
    customerId: process.env.MESSAGE_CENTRAL_CUSTOMER_ID,
    key: process.env.MESSAGE_CENTRAL_KEY,           // Base64 password
    scope: "NEW",
    country: process.env.COUNTRY_CODE,
    email: "lakhan1999mom@gmail.com"                 // 🔥 REQUIRED
  });

  const res = await axios.post(
    `${BASE_URL}/auth/v1/authentication/token`,
    body.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "*/*"
      }
    }
  );

  console.log("✅ TOKEN GENERATED");
  return res.data.data.authToken;
};


/* ================= VERIFY OTP ================= */
export const verifyOtpService = async (authToken, verificationId, code) => {
  const res = await axios.get(
    `${BASE_URL}/verification/v3/validateOtp`,
    {
      headers: {
        authToken
      },
      params: {
        countryCode: process.env.COUNTRY_CODE,
        customerId: process.env.MESSAGE_CENTRAL_CUSTOMER_ID,
        verificationId,
        code
      }
    }
  );

  console.log("✅ OTP VERIFIED");
  return res.data.data;
};
