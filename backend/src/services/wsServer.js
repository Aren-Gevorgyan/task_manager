const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const config = require("../config");

let wss;

const initWebSocketServer = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (socket, req) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    const token = requestUrl.searchParams.get("token");

    if (!token) {
      socket.close(1008, "Missing token");
      return;
    }

    try {
      const payload = jwt.verify(token, config.jwtSecret);
      socket.user = payload;
    } catch (error) {
      socket.close(1008, "Invalid token");
      return;
    }

    socket.send(
      JSON.stringify({
        event: "connected",
        payload: { message: "WebSocket connection established" },
      }),
    );
  });
};

const broadcast = (event, payload) => {
  if (!wss) {
    return;
  }

  const message = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

module.exports = { initWebSocketServer, broadcast };
