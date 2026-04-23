const express = require("express");
const cors = require("cors");
const logger = require("./shared/utils/logger");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check (VERY IMPORTANT in production)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});


// Global error handler (basic for now)
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;