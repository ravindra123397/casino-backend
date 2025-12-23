
import axios from "axios";

/* ================= GET BASE URL SAFELY ================= */
const getBaseUrl = () => {
  const url = process.env.MESSAGE_CENTRAL_BASE_URL;
  if (!url) {
    throw new Error("MessageCentral is not configured");
  }
  return url.replace(/\/$/, "");
};

/* ================= GENERATE TOKEN ================= */
export const generateToken = async () => {
  const BASE_URL = getBaseUrl();

  console.log("🔐 Generating MessageCentral token...");

  const res = await axios.post(
    `${BASE_URL}/auth/v1/authentication/token`,
    null,
    {
      params: {
        customerId: process.env.MESSAGE_CENTRAL_CUSTOMER_ID,
        key: process.env.MESSAGE_CENTRAL_KEY,
        scope: "NEW",
        country: process.env.COUNTRY_CODE,
        email: "lakhan1999mom@gmail.com"
      },
      headers: { accept: "*/*" }
    }
  );

  return res.data.data.authToken;
};

/* ================= SEND OTP ================= */
export const sendOtpService = async (authToken, phone) => {
  const BASE_URL = getBaseUrl();

  const res = await axios.post(
    `${BASE_URL}/verification/v3/send`,
    null,
    {
      headers: { authToken },
      params: {
        customerId: process.env.MESSAGE_CENTRAL_CUSTOMER_ID,
        countryCode: process.env.COUNTRY_CODE,
        flowType: "SMS",
        mobileNumber: phone
      }
    }
  );

  return res.data.data;
};

/* ================= VERIFY OTP ================= */
export const verifyOtpService = async (authToken, verificationId, code) => {
  const BASE_URL = getBaseUrl();

  const res = await axios.post(
    `${BASE_URL}/verification/v3/validateOtp`,
    null,
    {
      headers: { authToken },
      params: {
        verificationId,
        code,
        flowType: "SMS"
      }
    }
  );

  return res.data.data;
};
