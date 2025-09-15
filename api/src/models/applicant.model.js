const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const ApplicantSchema = new Schema(
  {
    // Basic fields collected at registration
    firstName: { type: String, trim: true, lowercase: true, required: true },
    middleName: { type: String, trim: true, lowercase: true },
    lastName: { type: String, trim: true, lowercase: true, required: true },
    phone: { type: String, trim: true, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    bvn: { type: String, required: true },

    password: { type: String, minlength: 8 },

    // Application details (added after OTP verification)
    appNumber: { type: String, unique: true },
    picture: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female"] },
    dob: { type: Date },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
    },
    nationality: { type: String },
    address: { type: String },
    idType: {
      type: String,
      enum: ["NIN", "DriverLicense", "Passport", "VoterCard"],
    },
    idNumber: { type: String },
    idUpload: { type: String }, // file path

    // Status
    status: {
      type: String,
      enum: ["pending", "active", "disabled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Auto-generate application number after OTP verification
ApplicantSchema.pre("save", async function (next, { skipNumberIncrement }) {
  if (skipNumberIncrement) return next();

  if (this.isNew && !this.appNumber && this.status === "active") {
    try {
      const year = new Date().getFullYear();
      const prefix = `APP-${year}-`;
      const regex = new RegExp(`^${prefix}\\d{3}$`);

      const lastApplicant = await mongoose.models.Applicant.findOne({
        appNumber: { $regex: regex },
      })
        .sort({ appNumber: -1 })
        .lean();

      let nextNumber = 1;
      if (lastApplicant && lastApplicant.appNumber) {
        const match = lastApplicant.appNumber.match(/APP-(\d{4})-(\d{3})/);
        if (match) {
          nextNumber = parseInt(match[2], 10) + 1;
        }
      }

      this.appNumber = `${prefix}${String(nextNumber).padStart(3, "0")}`;
    } catch (err) {
      return next(err);
    }
  } else if (this.appNumber) {
    this.appNumber = this.appNumber.toUpperCase();
  }

  next();
});

// Password hashing (if you want applicants to log in)
ApplicantSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

ApplicantSchema.methods.isValidPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Applicant", ApplicantSchema);
