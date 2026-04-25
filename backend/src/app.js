const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const tasksRoutes = require("./routes/tasksRoutes");
const callbacksRoutes = require("./routes/callbacksRoutes");
const webhooksRoutes = require("./routes/webhooksRoutes");
const config = require("./config");

const app = express();

app.use(cors({ origin: config.corsOrigin }));
// Raise JSON payload size limit so frontend can send files larger than 1MB.
app.use(express.json({ limit: config.bodyLimit }));
// Keep urlencoded parser limit aligned with JSON limit for form submissions.
app.use(express.urlencoded({ extended: true, limit: config.bodyLimit }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);
app.use("/callbacks", callbacksRoutes);
app.use("/webhooks", webhooksRoutes);

module.exports = app;
