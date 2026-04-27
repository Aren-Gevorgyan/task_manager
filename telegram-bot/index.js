const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.TELEGRAM_WEB_APP_URL;

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN in environment variables.");
  process.exit(1);
}

if (!webAppUrl) {
  console.error("Missing TELEGRAM_WEB_APP_URL in environment variables.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const startMessage = [
  "Task Manager bot is ready.",
  "Tap the button below to open the app.",
].join("\n");

bot.onText(/\/start/, (message) => {
  bot.sendMessage(message.chat.id, startMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open Task Manager",
            web_app: { url: webAppUrl },
          },
        ],
      ],
    },
  });
});

bot.on("polling_error", (error) => {
  console.error("Telegram polling error:", error.message);
});

console.log("Telegram bot started in polling mode.");
