const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const { globalLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const config = require("./config/config");

const app = express();

// ─── Security Middleware ────────────────────────────────────────────
app.use(helmet());                        // HTTP security headers
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.params);
  next();
});
app.use((req, res, next) => {
  const sanitizeXSS = (obj) => {
    if (typeof obj === "string") return xss(obj);
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        obj[key] = sanitizeXSS(obj[key]);
      }
    }
    return obj;
  };
  if (req.body) req.body = sanitizeXSS(req.body);
  next();
});                                        // prevent XSS attacks
app.use(globalLimiter);                   // rate limiting

// ─── CORS ───────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Body Parsers ───────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Compression ───────────────────────────────────────────────────
app.use(compression());

// ─── HTTP Request Logging ──────────────────────────────────────────
if (config.env === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ─── Health Check ──────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    env: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────
app.use("/api/v1", require("./routes/index"));

// ─── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────
app.use(errorHandler);

module.exports = app;