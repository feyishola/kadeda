require("./connections/mongo.connection")();
const express = require("express");
const cors = require("cors");
const { appPort } = require("./config");

const app = express();

// Middleware
app.use(express.json({ limit: "100mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Log every request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/v1/auth", require("./routes/auth.routes")());
app.use("/dropdown", require("./routes/sideattraction.routes")());

// Default 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});

// Error handler (safety net)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ ok: false, message: "Internal server error" });
});

// Start server
app.listen(appPort, () => {
  console.log(`🚀 Server is running on port ${appPort}`);
});
