const crypto = require("crypto");
const express = require("express");
const config = require("../config");
const { processPaymentWebhook } = require("../services/webhookProcessor");

const router = express.Router();

const computeSignature = (body) =>
  crypto.createHmac("sha256", config.webhookSecret).update(JSON.stringify(body)).digest("hex");

const normalizeSignature = (signatureHeaderValue) => {
  if (!signatureHeaderValue) {
    return "";
  }

  return signatureHeaderValue.startsWith("sha256=")
    ? signatureHeaderValue.slice("sha256=".length)
    : signatureHeaderValue;
};

router.post("/payment", (req, res) => {
  const signature = req.headers["x-signature"];
  if (!signature) {
    return res.status(401).json({ message: "Missing signature" });
  }

  const expected = computeSignature(req.body);
  const provided = normalizeSignature(signature);
  if (provided !== expected) {
    return res.status(401).json({ message: "Invalid signature" });
  }

  const { taskId, status, webhookId } = req.body;

  if (!taskId || !status || !webhookId) {
    return res.status(400).json({ message: "taskId, status, webhookId are required" });
  }

  res.status(200).json({ received: true });

  setImmediate(() => {
    processPaymentWebhook({ taskId, status, webhookId });
  });
});

module.exports = router;
