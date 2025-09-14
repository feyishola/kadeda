const LoanSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
    },
    loanType: { type: String, enum: ["nano", "micro", "SME", "assetFinance"] },
    amountRequested: { type: Number, required: true },
    tenureMonths: { type: Number },
    purpose: {
      type: String,
      enum: ["workingCapital", "assetPurchase", "expansion", "other"],
    },
    collateral: { type: String },
    status: {
      type: String,
      enum: ["submitted", "underReview", "approved", "declined"],
      default: "submitted",
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", LoanSchema);
