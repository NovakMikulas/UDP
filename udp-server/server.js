import dgram from "dgram";
import dotenv from "dotenv";
import { decodeMessage } from "./services/decoder.js";
import { validateMessage } from "./services/validator.js";
import { sendWebhook } from "./services/webhook.js";
import { buildDownlink } from "./services/downlink.js";
dotenv.config();

const server = dgram.createSocket("udp4");

const PORT = process.env.PORT || 4444;

server.on("listening", () => {
  const address = server.address();
  console.log(`UDP server is running on port: ${address.port}`);
});

server.on("error", (err) => {
  console.error(`Server error:\n${err.stack}`);
  server.close();
});

server.bind(PORT);

server.on("message", async (msg, rinfo) => {
  try {
    if (!(await validateMessage(msg))) return;
    const processedData = await decodeMessage(msg);

    const downlink = buildDownlink(processedData);
    if (downlink) {
      server.send(downlink, rinfo.port, rinfo.address, (err) => {
        if (err) console.error("[Downlink] Failed to send:", err.message);
      });
    }

    await sendWebhook(processedData);
  } catch (error) {
    console.error(`[UDP] Failed to process message from ${rinfo.address}:${rinfo.port}:`, error.message);
  }
});
