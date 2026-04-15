const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task_manager",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret",
  webhookSecret: process.env.WEBHOOK_SECRET || "dev_webhook_secret",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  testUser: {
    username: process.env.TEST_USER || "admin",
    password: process.env.TEST_PASSWORD || "password123",
  },
};

module.exports = config;
