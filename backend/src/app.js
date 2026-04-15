const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const tasksRoutes = require("./routes/tasksRoutes");
const callbacksRoutes = require("./routes/callbacksRoutes");
const webhooksRoutes = require("./routes/webhooksRoutes");
const config = require("./config");

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/tasks", tasksRoutes);
app.use("/callbacks", callbacksRoutes);
app.use("/webhooks", webhooksRoutes);

module.exports = app;
