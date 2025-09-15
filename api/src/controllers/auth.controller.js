const ApplicantModel = require("../models/auth.model");
const redisCtrl = require("./redis.controller");
const emailController = require("./email.controller");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

class AuthController {
  /**
   * STEP 1: Register Applicant (temporary in Redis)
   */
  async registerUser(body) {
    try {
      const { email, phone, bvn, firstName, middleName, lastName } = body;

      // Validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("A valid email address is required.");
      }
      if (!phone || !/^\d{11}$/.test(phone)) {
        throw new Error("Phone number is required and must be 11 digits.");
      }
      if (!bvn || !/^\d{11}$/.test(bvn)) {
        throw new Error("A valid 11-digit BVN is required.");
      }

      // Check if applicant already exists
      const applicantExists = await ApplicantModel.findOne({
        $or: [{ email }, { phone }],
      });
      if (applicantExists) throw new Error("Applicant already exists");

      // Store initial data temporarily in Redis
      const otp = this.generateSixDigitCode();
      const payload = JSON.stringify({
        email,
        phone,
        bvn,
        firstName,
        middleName,
        lastName,
      });

      await redisCtrl.write(`kadeda-register:${email}`, payload, 900); // 15 mins
      await redisCtrl.write(`kadeda-code-register:${email}`, otp, 900);
      console.log("testing otp", otp);

      // Send OTP email
      await emailController.verifyEmailEnumerator(email, otp);

      return {
        ok: true,
        message: "Registration started. Check your email for the OTP.",
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  /**
   * STEP 2: Verify OTP and create Applicant in MongoDB
   */
  async verifyOtp(email, otp) {
    try {
      const storedOtp = await redisCtrl.read(`kadeda-code-register:${email}`);
      if (!storedOtp || storedOtp !== otp) {
        throw new Error("Invalid or expired OTP");
      }

      // Retrieve applicant payload from Redis
      const applicantData = await redisCtrl.read(`kadeda-register:${email}`);
      if (!applicantData)
        throw new Error("Registration data expired. Restart process.");

      const { phone, bvn } = JSON.parse(applicantData);

      // Create Applicant in MongoDB
      const newApplicant = new ApplicantModel({
        email,
        phone,
        bvn,
        firstName,
        middleName,
        lastName,
        status: "active",
      });
      await newApplicant.save({ validateBeforeSave: false });

      // Clean up Redis
      await redisCtrl.del(`kadeda-register:${email}`);
      await redisCtrl.del(`kadeda-code-register:${email}`);

      // Send welcome email
      await emailController.welcomeApplicants(email);

      return {
        ok: true,
        data: newApplicant,
        message: "Email verified successfully. Applicant created.",
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  /**
   * STEP 3: Applicant completes profile
   */
  async createApplicantProfile(appNumber, applicantData) {
    try {
      const applicant = await ApplicantModel.findOne({ appNumber });
      if (!applicant) throw new Error("Applicant not found");
      if (applicant.status !== "active")
        throw new Error("Applicant not active");

      // Prevent overwriting protected fields
      const forbidden = ["_id", "appNumber", "status", "email", "phone", "bvn"];
      forbidden.forEach((f) => delete applicantData[f]);

      Object.assign(applicant, applicantData);
      await applicant.save();

      return {
        ok: true,
        data: applicant,
        message: "Applicant profile updated successfully",
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  /**
   * STEP 2b: Resend OTP
   */
  async resendOtp(email) {
    try {
      // Check if registration exists in Redis
      const applicantData = await redisCtrl.read(`kadeda-register:${email}`);
      if (!applicantData) {
        throw new Error("No pending registration found. Please start again.");
      }

      // Generate new OTP
      const otp = this.generateSixDigitCode();

      // Store new OTP in Redis (reset expiry to 15 mins)
      await redisCtrl.write(`kadeda-code-register:${email}`, otp, 900);

      // Send OTP via email
      await emailController.verifyEmailEnumerator(email, otp);

      return { ok: true, message: "A new OTP has been sent to your email." };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  /**
   * STEP 4: Login
   */
  async login(email, password) {
    try {
      const user = await ApplicantModel.findOne({ email });
      if (!user) throw new Error("User not found");

      const isValid = await user.isValidPassword(password);
      if (!isValid) throw new Error("Invalid password");

      if (user.status !== "active") throw new Error("Account not activated");

      const accessToken = this.encodeToken(
        { id: user._id, email: user.email, role: user.role },
        { expiresIn: "1h" }
      );
      const refreshToken = this.encodeToken(
        { id: user._id, email: user.email, role: user.role },
        { expiresIn: "7d" }
      );

      await redisCtrl.write(`kadeda-token::${user.email}`, refreshToken);

      return {
        ok: true,
        data: { user, accessToken, refreshToken },
        message: "Login successful",
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  /**
   * Recover Account (sends OTP for password reset)
   */
  async recoverAccount(email) {
    try {
      const account = await ApplicantModel.findOne({ email });
      if (!account) throw new Error("Account not found");

      const otp = this.generateSixDigitCode();
      await redisCtrl.write(`kadeda-code-reset:${email}`, otp, 600);
      await emailController.forgetPasswordEnumerator(email, otp);

      return { ok: true, message: "Recovery OTP sent to your email" };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  /**
   * Reset Password
   */
  async resetPassword(email, otp, newPassword) {
    try {
      const value = await redisCtrl.read(`kadeda-code-reset:${email}`);
      if (!value || value !== otp) throw new Error("Invalid or expired OTP");

      const user = await ApplicantModel.findOne({ email });
      if (!user) throw new Error("Account not found");

      await user.changePassword(newPassword);

      return { ok: true, message: "Password reset successfully" };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  /**
   * Activate Account (Admin or OTP flow)
   */
  async activateAccount(userId) {
    try {
      const user = await ApplicantModel.findById(userId);
      if (!user) throw new Error("User not found");

      user.status = "active";
      await user.save();

      return { ok: true, message: "Account activated successfully" };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  /**
   * Deactivate Account (Admin flow)
   */
  async deactivateAccount(userId) {
    try {
      const user = await ApplicantModel.findById(userId);
      if (!user) throw new Error("User not found");

      user.status = "inactive";
      await user.save();

      return { ok: true, message: "Account deactivated successfully" };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }

  async getUsers({ page = 1, limit = 10, search, status }) {
    try {
      const query = {};

      if (search) {
        query.$or = [
          { firstName: new RegExp(search, "i") },
          { lastName: new RegExp(search, "i") },
          { middleName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { phone: new RegExp(search, "i") },
          { bvn: new RegExp(search, "i") },
          { appNumber: new RegExp(search, "i") },
        ];
      }

      if (status) {
        query.status = status;
      }

      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        ApplicantModel.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        ApplicantModel.countDocuments(query),
      ]);

      return {
        ok: true,
        data: users,
        meta: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
        message: "Users fetched successfully",
      };
    } catch (error) {
      console.log("Error fetching users:", error.message);
      return { ok: false, message: error.message };
    }
  }

  async getUser(id) {
    try {
      const user = await ApplicantModel.findById(id);
      return { ok: true, data: user, message: "User fetched successfully" };
    } catch (error) {
      console.log("Error fetching users:", error.message);
      return { ok: false, message: error.message };
    }
  }

  async updateUser(id, newData) {
    try {
      const user = await ApplicantModel.findByIdAndUpdate(id, newData, {
        new: true,
      });
      return {
        ok: true,
        data: user,
        message: user
          ? "User updated successfully"
          : "No record updated.. Data not found !!!",
      };
    } catch (error) {
      console.log("Error updating user:", error.message);
      return { ok: false, message: error.message };
    }
  }

  /**
   * Utilities
   */
  encodeToken(payload, options = {}) {
    return jwt.sign(payload, jwtSecret, options);
  }

  decodeToken(token) {
    return jwt.verify(token, jwtSecret);
  }

  generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  handleDuplicateKeyError(error) {
    if (error.code === 11000) {
      return { ok: false, message: "Duplicate record exists." };
    }
    return { ok: false, message: error.message };
  }
}

module.exports = new AuthController();
