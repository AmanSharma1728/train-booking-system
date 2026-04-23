const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const routes = require("./routes");
const logger = require("./shared/utils/logger");

const app = express();

// ======================
// Load OpenAPI spec
// ======================
const swaggerDocument = YAML.load(
  path.join(__dirname, "../docs/openapi.yaml")
);

// ======================
// Global Middlewares
// ======================
app.use(cors());
app.use(express.json());

// ======================
// Health Check
// ======================
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ======================
// Routes
// ======================
app.use("/api/v1", routes);

// ======================
// Swagger Docs
// ======================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// ======================
// 404 Handler
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ======================
// Global Error Handler
// ======================
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;