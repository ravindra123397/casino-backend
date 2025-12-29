import UserProfile from "../models/UserProfile.js";

/* ================= GET USER PROFILE ================= */
export const getUserProfile = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const profile = await UserProfile.findOne({ phone }).populate(
      "loan.loanId"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.json({
      success: true,
      message: "User profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};
