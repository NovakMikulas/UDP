import dgram from "dgram";
import { unpackPacket, packResponse, FLAG_ACK } from "./services/validator.js";

const server = dgram.createSocket("udp4");
const PORT = process.env.PORT || 5003;

server.on("listening", () => {
  console.log(`UDP server running on port: ${server.address().port}`);
});

server.on("message", async (msg, rinfo) => {
  try {
    const packet = unpackPacket(msg);
    
    // Vždy odpověz ACK
    const ack = packResponse(packet.serialNumber, FLAG_ACK, packet.sequence + 1);
    server.send(ack, rinfo.port, rinfo.address, (err) => {
      if (err) console.error("[Server] ACK failed:", err.message);
      else console.log("[Server] ACK sent");
    });
    
  } catch (error) {
    console.error(`[UDP] Error: ${error.message}`);
  }
});

server.on("error", (err) => {
  console.error(`Server error: ${err.stack}`);
  server.close();
});

server.bind(PORT);