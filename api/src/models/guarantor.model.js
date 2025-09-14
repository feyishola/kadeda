const GuarantorSchema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
    },
    fullName: { type: String, required: true },
    relationship: { type: String },
    occupation: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    idUpload: { type: String },
    passportPhoto: { type: String },
    consentForm: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guarantor", GuarantorSchema);
