const dgram = require("dgram");

const createUdpResponse = (message) => {
  const normalizedMessage = message.trim().toLowerCase();

  if (normalizedMessage === "ping") {
    return JSON.stringify({
      status: "ok",
      protocol: "udp",
      reply: "pong",
      serverPid: process.pid,
      timestamp: new Date().toISOString(),
    });
  }

  return JSON.stringify({
    status: "ok",
    protocol: "udp",
    echo: message,
    serverPid: process.pid,
    timestamp: new Date().toISOString(),
  });
};

const initUdpServer = (port) => {
  const udpServer = dgram.createSocket("udp4");

  udpServer.on("message", (messageBuffer, remoteInfo) => {
    const message = messageBuffer.toString("utf8");
    const payload = Buffer.from(createUdpResponse(message));

    udpServer.send(payload, remoteInfo.port, remoteInfo.address);
  });

  udpServer.on("error", (error) => {
    console.error("UDP server error", error.message);
  });

  udpServer.bind(port, () => {
    console.log(`UDP listening on udp://0.0.0.0:${port}`);
  });
};

module.exports = { initUdpServer };
