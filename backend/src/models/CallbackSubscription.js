const mongoose = require("mongoose");

const callbackSubscriptionSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    event: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

callbackSubscriptionSchema.index({ url: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("CallbackSubscription", callbackSubscriptionSchema);
