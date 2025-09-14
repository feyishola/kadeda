const AuthController = require("../controllers/auth.controller");
const express = require("express");
const { base64toURL } = require("../middleware/upload.middleware");

module.exports = () => {
  const api = new express.Router();

  api.post("/register", async (req, res) => {
    try {
      const body = req.body;
      const { ok, data, message } = await AuthController.register(body);
      if (!ok) throw new Error(message);
      res.status(201).json({ ok, data, message });
    } catch (error) {
      res.status(400).json({ ok: false, message: error.message });
    }
  });

  // api.post("/register-admin", async (req, res) => {
  //   try {
  //     const body = req.body;
  //     const { ok, data, message } = await AuthController.register(body, true);
  //     if (!ok) throw new Error(message);
  //     res.status(201).json({ ok, data, message });
  //   } catch (error) {
  //     res.status(400).json({ ok: false, message: error.message });
  //   }
  // });

  api.post("/verify-email", async (req, res) => {
    try {
      const { email } = req.body;
      const { ok, message } = await AuthController.verifyEmail(email);
      if (ok) {
        res.status(200).json({ ok, message });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/login", async (req, res) => {
    try {
      const { email, password, notificationId } = req.body;
      const { ok, data, message } = await AuthController.login(
        email,
        password,
        notificationId
      );
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(400).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/refresh-token", async (req, res) => {
    const { refreshToken, email } = req.body;
    try {
      const { ok, data, message } = await AuthController.getAccessToken(
        email,
        refreshToken
      );
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(400).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/recover-account", async (req, res) => {
    try {
      const { email } = req.body;
      const { ok, message } = await AuthController.recoverAccount(email);
      if (ok) {
        res.status(200).json({ ok, message });
      } else {
        res.status(400).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/validate-code", async (req, res) => {
    try {
      const { email, otp } = req.body;
      const { ok, data, message } = await AuthController.validateCode(
        otp,
        email
      );
      if (ok) {
        res.status(200).json({ ok, data, message });
      } else {
        res.status(500).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/reset-password", async (req, res) => {
    try {
      const { password, token } = req.body;
      const { ok, data, message } = await AuthController.resetPassword(
        token,
        password
      );
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(400).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.post("/activate-account", async (req, res) => {
    try {
      const { password, token } = req.body;
      const { ok, data, message } = await AuthController.activateAccount(
        token,
        password
      );
      if (ok) {
        res.status(200).json({ ok, data });
      } else {
        res.status(400).json({ ok, message });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.get("/", async (req, res) => {
    try {
      const filter = req.query;
      const { ok, data, message } = await AuthController.getUsers(filter);
      if (ok) {
        res.status(200).json({ ok, message, data });
      } else {
        res.status(500).json({ ok, message, data });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.put("/activate/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const { ok, data, message } = await AuthController.updateUser(id, {
        status: "active",
      });
      if (ok) {
        res.status(200).json({ ok, message, data });
      } else {
        res.status(500).json({ ok, message, data });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  api.put("/deactivate/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { ok, data, message } = await AuthController.updateUser(id, {
        status: "disable",
      });
      if (ok) {
        res.status(200).json({ ok, message, data });
      } else {
        res.status(500).json({ ok, message, data });
      }
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // api.put("/:id", async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const body = req.body;
  //     const { ok, data, message } = await AuthController.updateUser(id, body);
  //     if (ok) {
  //       res.status(200).json({ ok, message, data });
  //     } else {
  //       res.status(500).json({ ok, message, data });
  //     }
  //   } catch (error) {
  //     res.status(500).json({ ok: false, message: error.message });
  //   }
  // });

  return api;
};
