import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phone: { type: String, unique: true },
    panNumber: { type: String, unique: true },

    aadhaarFront: String,
    aadhaarBack: String,
    panFile: String,

    amountRequested: Number,
    approvedAmount: Number,
    deduction8Percent: Number,
    processingFee5Percent: Number,

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "RESTART"],
      default: "PENDING",
    },

    restartReasons: [String],

    userMessage: String,
  },
  { timestamps: true }
);

export default mongoose.model("Loan", loanSchema);
