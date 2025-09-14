const ApplicantSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gender: { type: String, enum: ["male", "female"] },
    dob: { type: Date },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed"],
    },
    nationality: { type: String },
    address: { type: String },
    bvn: { type: String, required: true },
    idType: {
      type: String,
      enum: ["NIN", "DriverLicense", "Passport", "VoterCard"],
    },
    idNumber: { type: String },
    idUpload: { type: String }, // file path
  },
  { timestamps: true }
);

module.exports = mongoose.model("Applicant", ApplicantSchema);
