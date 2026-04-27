const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config");
const { initWebSocketServer } = require("./services/wsServer");
const { initUdpServer } = require("./services/udpServer");

const start = async () => {
  try {
    await mongoose.connect(config.mongoUri);

    const server = http.createServer(app);
    initWebSocketServer(server);
    initUdpServer(config.udpPort);

    server.listen(config.port, () => {
      console.log(`API listening on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error.message);
    process.exit(1);
  }
};

start();
