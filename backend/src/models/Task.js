const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "done", "cancelled"],
      default: "pending",
    },
    assignee: { type: String, default: "", trim: true },
    dueDate: { type: Date, default: null },
    paymentStatus: { type: String, enum: ["paid", "failed"], default: undefined },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

module.exports = mongoose.model("Task", taskSchema);
