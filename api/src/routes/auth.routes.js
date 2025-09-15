const express = require("express");
const AuthController = require("../controllers/auth.controller");

module.exports = () => {
  const api = new express.Router();

  // Step 1: Register user
  api.post("/register", async (req, res) => {
    try {
      const result = await AuthController.registerUser(req.body);
      res.status(result.ok ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // Step 2: Verify OTP
  api.post("/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      const result = await AuthController.verifyOtp(email, otp);
      res.status(result.ok ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // Step 2b: Resend OTP
  api.post("/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;
      const result = await AuthController.resendOtp(email);
      res.status(result.ok ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // Step 3: Applicant profile
  api.post("/applicant/register", async (req, res) => {
    try {
      const { appNumber, ...applicantData } = req.body;
      const result = await AuthController.createApplicantProfile(
        appNumber,
        applicantData
      );
      res.status(result.ok ? 201 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // Step 4: Login
  api.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await AuthController.login(email, password);
      res.status(result.ok ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // Recover Account (send OTP for password reset)
  api.post("/recover-account", async (req, res) => {
    try {
      const { email } = req.body;
      const result = await AuthController.recoverAccount(email);
      res.status(result.ok ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // Reset Password
  api.post("/reset-password", async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await AuthController.resetPassword(
        email,
        otp,
        newPassword
      );
      res.status(result.ok ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // Activate Account (admin or system action)
  api.patch("/activate", async (req, res) => {
    try {
      const { userId } = req.body;
      const result = await AuthController.activateAccount(userId);
      res.status(result.ok ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // Deactivate Account (admin action)
  api.patch("/deactivate", async (req, res) => {
    try {
      const { userId } = req.body;
      const result = await AuthController.deactivateAccount(userId);
      res.status(result.ok ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.get("/users", async (req, res) => {
    try {
      const { page, limit, search, status } = req.query;
      const result = await AuthController.getUsers({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search,
        status,
      });
      res.status(result.ok ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.get("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await AuthController.getUser(id);
      res.status(result.ok ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.patch("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await AuthController.updateUser(id, req.body);
      res.status(result.ok ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  return api;
};
