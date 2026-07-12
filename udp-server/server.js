// server.js
import dgram from "dgram";
import dotenv from "dotenv";
import { unpackPacket, packResponse, FLAG_ACK, FLAG_FIRST, FLAG_LAST } from "./services/validator.js";
import { decodeMessage } from "./services/decoder.js";
import { sendWebhook } from "./services/webhook.js";

dotenv.config();

const server = dgram.createSocket("udp4");
const PORT = process.env.PORT || 5003;

server.on("listening", () => {
  console.log(`UDP server running on port: ${server.address().port}`);
});

server.on("error", (err) => {
  console.error(`Server error:\n${err.stack}`);
  server.close();
});

server.bind(PORT);

server.on("message", async (msg, rinfo) => {
  try {
    const packet = unpackPacket(msg);

    // Vždy odpověz ACK se správným hashem
    const ackSequence = packet.sequence === 0 ? 1 : packet.sequence + 1;
    const ack = packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null);
    server.send(ack, rinfo.port, rinfo.address, (err) => {
      if (err) console.error("[Server] ACK failed:", err.message);
      else console.log(`[Server] ACK sent, seq=${ackSequence}`);
    });

    // Zpracuj data pokud nejde o handshake (prázdná data = handshake)
    if (packet.data && packet.data.length > 0) {
      console.log("[Server] Processing data packet, data_len:", packet.data.length);
      // TODO: dekódovat CBOR a poslat webhook až budeme vědět formát datových paketů
    }

  } catch (error) {
    console.error(`[UDP] Error: ${error.message}`);
  }
});