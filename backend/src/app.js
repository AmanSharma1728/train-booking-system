const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const logger = require("./shared/utils/logger");

const app = express();

// ======================
// Global Middlewares
// ======================

// Load OpenAPI spec
const swaggerDocument = YAML.load(path.join(__dirname, "../docs/openapi.yaml"));

// Middlewares
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

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 Handler (IMPORTANT)
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

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;