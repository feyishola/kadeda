const { BUSINESS_SECTORS, SECTORS } = require("./enums/business.enums");

const BusinessSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
    },
    businessName: { type: String, required: true },
    businessType: {
      type: String,
      enum: [
        "Sole Proprietor",
        "Partnership",
        "Limited Liability",
        "Cooperative",
        "Other",
      ],
    },
    registrationType: {
      type: String,
      enum: [
        "CAC Registration",
        "SMEDAN Certificate",
        "KADEDA Certificate",
        "Cooperatives Certificate",
      ],
    },
    registrationCertificate: { type: String }, // file path
    registrationNumber: { type: String },
    sector: { type: String, enum: SECTORS, required: true },
    industry: { type: String, required: true },
    businessAddress: { type: String },
    businessAge: { type: Number },
    employees: { type: Number },
    monthlyTurnover: { type: Number },
    accountNumber: { type: String },
    bankName: { type: String },
    utilityBill: { type: String },
    documents: [String],
  },
  { timestamps: true }
);

// Custom validation to ensure industry belongs to sector
BusinessSchema.pre("validate", function (next) {
  if (this.sector && this.industry) {
    const validIndustries = BUSINESS_SECTORS[this.sector] || [];
    if (!validIndustries.includes(this.industry)) {
      return next(
        new Error(
          `Industry "${this.industry}" is not valid for sector "${this.sector}"`
        )
      );
    }
  }
  next();
});

module.exports = mongoose.model("Business", BusinessSchema);
