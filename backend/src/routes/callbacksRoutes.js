const express = require("express");
const CallbackSubscription = require("../models/CallbackSubscription");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authenticate, async (req, res) => {
  const { url, event } = req.body;

  if (!url || !event) {
    return res.status(400).json({ message: "url and event are required" });
  }

  const isValidEvent = event === "task.completed";
  if (!isValidEvent) {
    return res.status(400).json({ message: "Unsupported event" });
  }

  const subscription = await CallbackSubscription.findOneAndUpdate(
    { url, event },
    { url, event },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return res.status(201).json(subscription);
});

module.exports = router;
