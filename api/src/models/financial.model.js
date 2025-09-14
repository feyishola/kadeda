const FinancialSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
    },
    avgMonthlySales: { type: Number },
    avgMonthlyExpenses: { type: Number },
    existingLoans: [
      {
        institution: String,
        amount: Number,
        repaymentStatus: {
          type: String,
          enum: ["ongoing", "completed", "defaulted"],
        },
      },
    ],
    bankStatement: { type: String },
    tin: { type: String },
    financialRecords: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Financial", FinancialSchema);
