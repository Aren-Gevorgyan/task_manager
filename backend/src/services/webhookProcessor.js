const Task = require("../models/Task");
const ProcessedWebhook = require("../models/ProcessedWebhook");
const { broadcast } = require("./wsServer");

const processPaymentWebhook = async (payload) => {
  const { taskId, status, webhookId } = payload;

  try {
    const existing = await ProcessedWebhook.findOne({ webhookId }).lean();
    if (existing) {
      return;
    }

    await ProcessedWebhook.create({ webhookId });

    let updatedTask = null;
    if (status === "paid") {
      updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { paymentStatus: "paid" },
        { new: true },
      );
    } else if (status === "failed") {
      updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { status: "cancelled", paymentStatus: "failed" },
        { new: true },
      );
    }

    broadcast("webhook_received", {
      webhookId,
      taskId,
      status,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Webhook processing failed", error.message);
  }
};

module.exports = { processPaymentWebhook };
