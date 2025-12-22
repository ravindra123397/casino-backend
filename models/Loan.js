import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,

  phone: { type: String, unique: true },
  panNumber: { type: String, unique: true, uppercase: true },

  aadhaarFront: String,
  aadhaarBack: String,
  panFile: String,

  amountRequested: Number,

  deduction8Percent: Number,
  approvedAmount: Number,
  processingFee5Percent: Number,

  status: {
    type: String,
    enum: ["PENDING", "APPROVED"],
    default: "PENDING"
  },

  userMessage: String
}, { timestamps: true });

export default mongoose.model("Loan", loanSchema);
