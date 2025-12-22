import Loan from "../models/Loan.js";
import cloudinary from "../config/cloudinary.js";

const upload = async (file, folder) => {
  const r = await cloudinary.uploader.upload(file.tempFilePath, { folder });
  return r.secure_url;
};

export const applyLoan = async (req, res) => {
  const { firstName, lastName, phone, panNumber, amount } = req.body;

  if (await Loan.findOne({ phone }))
    return res.status(409).json({ message: "Phone already used" });

  if (await Loan.findOne({ panNumber: panNumber.toUpperCase() }))
    return res.status(409).json({ message: "PAN already used" });

  const loan = await Loan.create({
    firstName,
    lastName,
    phone,
    panNumber: panNumber.toUpperCase(),
    aadhaarFront: await upload(req.files.aadhaarFront, "loan/aadhaar"),
    aadhaarBack: await upload(req.files.aadhaarBack, "loan/aadhaar"),
    panFile: await upload(req.files.panFile, "loan/pan"),
    amountRequested: amount,
    userMessage: "Loan submitted. Waiting for admin approval."
  });

  res.json({ loanId: loan._id });
};

export const approveLoan = async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  const deduction = loan.amountRequested * 0.08;
  const approved = loan.amountRequested - deduction;
  const fee = deduction * 0.05;

  loan.status = "APPROVED";
  loan.deduction8Percent = deduction;
  loan.approvedAmount = approved;
  loan.processingFee5Percent = fee;
  loan.userMessage = `Loan Approved. ₹${approved} credited. Fee ₹${fee}`;

  await loan.save();
  res.json({ message: "Loan approved", loan });
};
