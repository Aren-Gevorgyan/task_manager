const express = require("express");
const Task = require("../models/Task");
const { authenticate } = require("../middleware/auth");
const { dispatchTaskCompletedCallbacks } = require("../services/callbackDispatcher");
const { broadcast } = require("../services/wsServer");

const router = express.Router();

router.get("/", async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const tasks = await Task.find(query).sort({ createdAt: -1 }).lean();
  return res.json(tasks);
});

router.post("/", authenticate, async (req, res) => {
  const { title, assignee = "", dueDate = null } = req.body;

  if (!title) {
    return res.status(400).json({ message: "title is required" });
  }

  const task = await Task.create({ title, assignee, dueDate });
  return res.status(201).json(task);
});

router.patch("/:id", authenticate, async (req, res) => {
  const allowedFields = ["title", "assignee", "dueDate", "status"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
  );

  const existingTask = await Task.findById(req.params.id);
  if (!existingTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  const previousStatus = existingTask.status;

  Object.assign(existingTask, updates);
  await existingTask.save();

  if (updates.status && updates.status !== previousStatus) {
    broadcast("task_updated", existingTask);

    if (updates.status === "done") {
      setImmediate(() => {
        dispatchTaskCompletedCallbacks(existingTask.toObject());
      });
    }
  }

  return res.json(existingTask);
});

router.delete("/:id", authenticate, async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  return res.status(204).send();
});

module.exports = router;
