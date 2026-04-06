const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const { db } = require("./config/db");
const { env } = require("./config/env");
const { sequelize } = require("./config/sequelize");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");
const { router } = require("./routes");
const { startNotificationQueueWorker } = require("./utils/notification-queue.service");

const app = express();
exports.app = app;

const configuredOrigins = (env.CLIENT_URLS ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const allowedOrigins = new Set(
  [
    env.CLIENT_URL,
    ...configuredOrigins,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter((item) => Boolean(item))
);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS: Origin khong duoc phep (${origin})`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Hospital E-Health API is running" });
});

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.use("/api/v1", router);
app.use(notFoundHandler);
app.use(errorHandler);

const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    await db.query("SELECT 1");
    console.log("Database connected...");

    app.listen(env.PORT, () => {
      console.log(`Server chay tai http://localhost:${env.PORT}`);
      startNotificationQueueWorker();
    });
  } catch (error) {
    console.error("Khong the ket noi database:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  void bootstrap();
}
