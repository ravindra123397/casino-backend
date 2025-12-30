import Loan from "../models/Loan.js";
import UserProfile from "../models/UserProfile.js";
import cloudinary from "../config/cloudinary.js";

/* ================= FILE UPLOAD ================= */
const upload = async (file, folder) => {
  if (!file) return null;

  if (!file.tempFilePath) {
    throw new Error("❌ tempFilePath missing. File upload middleware issue.");
  }

  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
  });

  return result.secure_url;
};

/* ================= RESTART REASONS ================= */
const ALLOWED_RESTART_REASONS = [
  "Your full name does not match with the name on your submitted documents",
  "Uploaded document image is unclear, blurred, or damaged",
  "Incorrect PAN number entered or PAN details do not match records",
  "Incomplete or missing required details in the application form",
];

/* ================= APPLY LOAN ================= */
export const applyLoan = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      panNumber,
      upiId,
      amount,
      bookType,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !panNumber ||
      !upiId ||
      !amount ||
      !bookType
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const activeLoan = await Loan.findOne({
      phone,
      status: { $in: ["PENDING", "APPROVED"] },
    });

    if (activeLoan) {
      return res.status(409).json({
        success: false,
        message: "Active loan already exists",
        status: activeLoan.status,
      });
    }

    let loan = await Loan.findOne({ phone, status: "RESTART" });

    const aadhaarFront = req.files?.aadhaarFront
      ? await upload(req.files.aadhaarFront, "loan/aadhaar")
      : null;

    const aadhaarBack = req.files?.aadhaarBack
      ? await upload(req.files.aadhaarBack, "loan/aadhaar")
      : null;

    const panFile = req.files?.panFile
      ? await upload(req.files.panFile, "loan/pan")
      : null;

    /* ===== RESTART CASE ===== */
    if (loan) {
      loan.firstName = firstName;
      loan.lastName = lastName;
      loan.panNumber = panNumber.toUpperCase();
      loan.upiId = upiId.toLowerCase();
      loan.bookType = bookType;
      loan.amountRequested = amount;
      loan.aadhaarFront = aadhaarFront;
      loan.aadhaarBack = aadhaarBack;
      loan.panFile = panFile;
      loan.status = "PENDING";
      loan.restartReasons = [];
      loan.userMessage = "Loan resubmitted. Waiting for approval.";
      await loan.save();
    } 
    /* ===== NEW LOAN ===== */
    else {
      loan = await Loan.create({
        firstName,
        lastName,
        phone,
        panNumber: panNumber.toUpperCase(),
        upiId: upiId.toLowerCase(),
        bookType,
        aadhaarFront,
        aadhaarBack,
        panFile,
        amountRequested: amount,
        status: "PENDING",
        userMessage: "Loan submitted. Waiting for admin approval.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Loan submitted successfully",
      status: loan.status,
      nextStep: null,
      data: loan,
    });
  } catch (err) {
    console.error("🔥 APPLY LOAN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Loan apply failed",
      error: err.message,
    });
  }
};

/* ================= GET LOAN STATUS ================= */
export const getLoanStatus = async (req, res) => {
  const loan = await Loan.findOne({ phone: req.params.phone }).sort({
    createdAt: -1,
  });

  if (!loan) {
    return res.status(404).json({
      success: false,
      message: "Loan not found",
    });
  }

  let nextStep = null;
  if (loan.status === "APPROVED") nextStep = 4;
  if (loan.status === "RESTART") nextStep = 2;

  res.json({
    success: true,
    message: "Loan status fetched successfully",
    status: loan.status,
    nextStep,
    data: loan,
  });
};

/* ================= ADMIN: GET ALL LOANS ================= */
export const getAllLoans = async (req, res) => {
  const loans = await Loan.find().sort({ createdAt: -1 });
  res.json({
    success: true,
    message: "All loans fetched successfully",
    data: loans,
  });
};

/* ================= ADMIN: GET SINGLE LOAN ================= */
export const getLoanDetails = async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    return res.status(404).json({
      success: false,
      message: "Loan not found",
    });
  }

  res.json({
    success: true,
    message: "Loan details fetched successfully",
    status: loan.status,
    data: loan,
  });
};

/* ================= ADMIN: APPROVE LOAN ================= */
export const approveLoan = async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    return res.status(404).json({
      success: false,
      message: "Loan not found",
    });
  }

  const deduction = loan.amountRequested * 0.08;
  const approvedAmount = loan.amountRequested - deduction;
  const processingFee = deduction * 0.05;

  loan.status = "APPROVED";
  loan.deduction8Percent = deduction;
  loan.approvedAmount = approvedAmount;
  loan.processingFee5Percent = processingFee;
  loan.userMessage = "Loan approved successfully";
  await loan.save();

  const profile = await UserProfile.findOneAndUpdate(
    { phone: loan.phone },
    {
      firstName: loan.firstName,
      lastName: loan.lastName,
      phone: loan.phone,
      panNumber: loan.panNumber,
      upiId: loan.upiId,
      bookType: loan.bookType,
      loanStatus: "APPROVED",
      loanDetails: {
        loanId: loan._id,
        amountRequested: loan.amountRequested,
        approvedAmount,
        deduction8Percent: deduction,
        processingFee5Percent: processingFee,
        approvedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: "Loan approved successfully",
    status: loan.status,
    nextStep: 4,
    data: { loan, userProfile: profile },
  });
};

/* ================= ADMIN: RESTART LOAN ================= */
export const restartLoan = async (req, res) => {
  const { reasons } = req.body;

  const invalid = reasons?.filter(
    (r) => !ALLOWED_RESTART_REASONS.includes(r)
  );

  if (!Array.isArray(reasons) || reasons.length === 0 || invalid.length) {
    return res.status(400).json({
      success: false,
      message: "Invalid restart reasons",
      invalidReasons: invalid,
    });
  }

  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    return res.status(404).json({
      success: false,
      message: "Loan not found",
    });
  }

  loan.status = "RESTART";
  loan.restartReasons = reasons;
  loan.userMessage =
    "Form restart required. Please correct the highlighted details.";
  await loan.save();

  res.json({
    success: true,
    message: "Loan marked for restart",
    status: loan.status,
    nextStep: 2,
    data: loan,
  });
};

/* ================= ADMIN: DELETE LOAN ================= */
export const deleteLoan = async (req, res) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan) {
    return res.status(404).json({
      success: false,
      message: "Loan not found",
    });
  }

  await loan.deleteOne();

  res.json({
    success: true,
    message: "Loan deleted successfully",
    status: "DELETED",
    data: loan,
  });
};
