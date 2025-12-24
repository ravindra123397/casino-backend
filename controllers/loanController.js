import Loan from "../models/Loan.js";
import cloudinary from "../config/cloudinary.js";

/* ================= FILE UPLOAD HELPER ================= */
const upload = async (file, folder) => {
  if (!file) return null;

  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
  });

  return result.secure_url;
};

/* ================= RESTART REASONS (FIXED) ================= */
const ALLOWED_RESTART_REASONS = [
  "Your full name does not match with the name on your submitted documents",
  "Uploaded document image is unclear, blurred, or damaged",
  "Incorrect PAN number entered or PAN details do not match records",
  "Incomplete or missing required details in the application form",
];

/* ================= APPLY LOAN (USER) ================= */
export const applyLoan = async (req, res) => {
  try {
    const { firstName, lastName, phone, panNumber, amount } = req.body;

    if (!firstName || !lastName || !phone || !panNumber || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    if (await Loan.findOne({ phone })) {
      return res.status(409).json({ message: "Phone already used" });
    }

    if (await Loan.findOne({ panNumber: panNumber.toUpperCase() })) {
      return res.status(409).json({ message: "PAN already used" });
    }

    if (
      !req.files ||
      !req.files.aadhaarFront ||
      !req.files.aadhaarBack ||
      !req.files.panFile
    ) {
      return res.status(400).json({ message: "All documents are required" });
    }

    const aadhaarFront = await upload(req.files.aadhaarFront, "loan/aadhaar");
    const aadhaarBack = await upload(req.files.aadhaarBack, "loan/aadhaar");
    const panFile = await upload(req.files.panFile, "loan/pan");

    const loan = await Loan.create({
      firstName,
      lastName,
      phone,
      panNumber: panNumber.toUpperCase(),
      aadhaarFront,
      aadhaarBack,
      panFile,
      amountRequested: amount,
      status: "PENDING",
      userMessage: "Loan submitted. Waiting for admin approval.",
    });

    res.status(201).json({
      message: "Loan applied successfully",
      loanId: loan._id,
    });
  } catch (error) {
    console.error("APPLY LOAN ERROR:", error);
    res.status(500).json({ message: "Loan application failed" });
  }
};

/* ================= GET LOAN STATUS (USER) ================= */
export const getLoanStatus = async (req, res) => {
  try {
    const { phone } = req.params;

    const loan = await Loan.findOne({ phone });

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.json({
      status: loan.status,
      amountRequested: loan.amountRequested,
      approvedAmount: loan.approvedAmount,
      message: loan.userMessage,
      restartReasons: loan.restartReasons || [],
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch loan status" });
  }
};

/* ================= ADMIN: GET ALL LOANS ================= */
export const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch loans" });
  }
};

/* ================= ADMIN: GET SINGLE LOAN ================= */
export const getLoanDetails = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch loan details" });
  }
};

/* ================= ADMIN: APPROVE LOAN ================= */
export const approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status === "APPROVED") {
      return res.status(400).json({ message: "Loan already approved" });
    }

    const deduction = loan.amountRequested * 0.08;
    const approvedAmount = loan.amountRequested - deduction;
    const processingFee = deduction * 0.05;

    loan.status = "APPROVED";
    loan.deduction8Percent = deduction;
    loan.approvedAmount = approvedAmount;
    loan.processingFee5Percent = processingFee;
    loan.userMessage = `Loan Approved. ₹${approvedAmount} credited. Processing Fee ₹${processingFee}`;

    await loan.save();

    res.json({ message: "Loan approved successfully", loan });
  } catch (error) {
    res.status(500).json({ message: "Loan approval failed" });
  }
};

/* ================= ADMIN: RESTART LOAN ================= */
export const restartLoan = async (req, res) => {
  try {
    const { reasons } = req.body;

    if (!Array.isArray(reasons) || reasons.length === 0) {
      return res.status(400).json({
        message: "At least one restart reason is required",
      });
    }

    // ❌ Reject invalid reasons
    const invalidReasons = reasons.filter(
      (r) => !ALLOWED_RESTART_REASONS.includes(r)
    );

    if (invalidReasons.length > 0) {
      return res.status(400).json({
        message: "Invalid restart reason selected",
        invalidReasons,
      });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    loan.status = "RESTART";
    loan.restartReasons = reasons;
    loan.userMessage =
      "Aapne form sahi se nahi bhara. Kripya neeche diye gaye reasons ke kaaran form dobara bharen.";

    await loan.save();

    res.json({
      message: "Loan marked for restart",
      restartReasons: reasons,
      loan,
    });
  } catch (error) {
    console.error("RESTART LOAN ERROR:", error);
    res.status(500).json({ message: "Loan restart failed" });
  }
};
