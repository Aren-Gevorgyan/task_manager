const axios = require("axios");
const CallbackSubscription = require("../models/CallbackSubscription");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const dispatchSingle = async (url, payload) => {
  try {
    const response = await axios.post(url, payload, { timeout: 5000 });
    if (response.status >= 200 && response.status < 300) {
      return;
    }
    throw new Error(`Non-2xx response: ${response.status}`);
  } catch (firstError) {
    try {
      await delay(500);
      const retryResponse = await axios.post(url, payload, { timeout: 5000 });
      if (retryResponse.status < 200 || retryResponse.status >= 300) {
        throw new Error(`Non-2xx response after retry: ${retryResponse.status}`);
      }
    } catch (retryError) {
      console.error("Callback dispatch failed", {
        url,
        firstError: firstError.message,
        retryError: retryError.message,
      });
    }
  }
};

const dispatchTaskCompletedCallbacks = async (task) => {
  try {
    const subscriptions = await CallbackSubscription.find({ event: "task.completed" }).lean();
    await Promise.all(subscriptions.map((sub) => dispatchSingle(sub.url, task)));
  } catch (error) {
    console.error("Failed to dispatch callbacks", error.message);
  }
};

module.exports = { dispatchTaskCompletedCallbacks };
