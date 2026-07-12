// server.js
import dgram from "dgram";
import dotenv from "dotenv";
import cbor from "cbor";
import { unpackPacket, packResponse, FLAG_ACK, FLAG_LAST } from "./services/validator.js";

dotenv.config();

const server = dgram.createSocket("udp4");
const PORT = process.env.PORT || 5003;

const DL_SET_SESSION = 0x00;
const UL_CREATE_SESSION = 0x00;
const UL_UPLOAD_DATA = 0x01;

function buildSessionResponse(serialNumber, sequence) {
  const sessionType = Buffer.alloc(1);
  sessionType[0] = DL_SET_SESSION;

  const map = new Map();
  map.set(0x00, 1);
  map.set(0x01, BigInt(0));
  map.set(0x02, BigInt(0));
  map.set(0x03, BigInt(0));
  map.set(0x04, BigInt(Math.floor(Date.now() / 1000)));
  map.set(0x05, "custom-server");
  map.set(0x06, "UDP Server");

  const cborData = cbor.encode(map);
  const data = Buffer.concat([sessionType, cborData]);

  return packResponse(serialNumber, FLAG_ACK | FLAG_LAST, sequence, data);
}

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
    const ackSequence = packet.sequence === 0 ? 1 : packet.sequence + 1;

    if (packet.data && packet.data.length > 0) {
      const msgType = packet.data[0];
      console.log(`[Server] Message type: 0x${msgType.toString(16)}`);

      if (msgType === UL_CREATE_SESSION) {
        console.log("[Server] Session create — sending session response");
        const sessionResp = buildSessionResponse(packet.serialNumber, ackSequence);
        server.send(sessionResp, rinfo.port, rinfo.address, (err) => {
          if (err) console.error("[Server] Session response failed:", err.message);
          else console.log("[Server] Session response sent");
        });
        return;
      }

      if (msgType === UL_UPLOAD_DATA) {
        console.log("[Server] Data packet received, data_len:", packet.data.length);
        console.log("[Server] Data hex:", packet.data.toString("hex"));
        // TODO: dekódovat CBOR a poslat webhook
      }
    }

    // Standardní ACK
    const ack = packResponse(packet.serialNumber, FLAG_ACK | FLAG_LAST, ackSequence, null);
    server.send(ack, rinfo.port, rinfo.address, (err) => {
      if (err) console.error("[Server] ACK failed:", err.message);
      else console.log(`[Server] ACK sent, seq=${ackSequence}`);
    });

  } catch (error) {
    console.error(`[UDP] Error: ${error.message}`);
  }
});