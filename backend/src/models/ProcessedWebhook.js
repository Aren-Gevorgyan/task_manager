const mongoose = require("mongoose");

const processedWebhookSchema = new mongoose.Schema(
  {
    webhookId: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ProcessedWebhook", processedWebhookSchema);
