


import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    panNumber: String,
    upiId: String,

    loanStatus: String,

    loan: {
      loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan",
      },
      amountRequested: Number,
      approvedAmount: Number,
      deduction8Percent: Number,
      processingFee5Percent: Number,
      approvedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserProfile", userProfileSchema);
