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
    const packet = await validateMessage(msg);
    if (!packet) return;

    // Vždy odpověz ACK
    const ack = buildAckResponse(packet);
    server.send(ack, rinfo.port, rinfo.address, (err) => {
      if (err) console.error("[Server] Failed to send ACK:", err.message);
      else console.log("[Server] ACK sent");
    });

    // Pokud je to datový paket (ne jen handshake), zpracuj data
    if (packet.data && packet.data.length > 0) {
      const processedData = await decodeMessage(packet);
      await sendWebhook(processedData);
    }
  } catch (error) {
    console.error(`[UDP] Error: ${error.message}`);
  }
});