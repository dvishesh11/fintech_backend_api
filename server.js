const app = require("./src/app");
const connectDB = require("./src/config/db");
const config = require("./src/config/config");
const logger = require("./src/utils/logger");

// Connect to MongoDB then start server
connectDB().then(() => {
  const server = app.listen(config.port, () => {
    logger.info(`🚀 Server running in ${config.env} mode on port ${config.port}`);
  });

  // ─── Graceful Shutdown ─────────────────────────────────────────
  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info("💤 HTTP server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // ─── Unhandled Rejections ──────────────────────────────────────
  process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // ─── Uncaught Exceptions ───────────────────────────────────────
  process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
  });
});