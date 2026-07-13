import dgram from "dgram";
import dotenv from "dotenv";
dotenv.config();

import { connectDb } from "./services/db.js";
import { unpackPacket } from "./services/protocol/packet.js";
import { handlePacket } from "./services/protocol/router.js";

const server = dgram.createSocket("udp4");
const PORT = process.env.PORT || 5003;

server.on("listening", () => {
  console.log(`UDP server running on port: ${server.address().port}`);
});

server.on("error", (err) => {
  console.error(`Server error:\n${err.stack}`);
  server.close();
});

await connectDb();
server.bind(PORT);

server.on("message", async (msg, rinfo) => {
  try {
    const packet = unpackPacket(msg);
    await handlePacket(packet, (response) => {
      server.send(response, rinfo.port, rinfo.address, (err) => {
        if (err) console.error("[Server] Send failed:", err.message);
      });
    });
  } catch (error) {
    console.error(`[UDP] Error: ${error.message}`);
  }
});