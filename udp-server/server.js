import dgram from "dgram";
import dotenv from "dotenv";
import cbor from "cbor";
import { unpackPacket, packResponse, FLAG_ACK, FLAG_FIRST, FLAG_LAST, FLAG_POLL } from "./services/validator.js";

dotenv.config();

const server = dgram.createSocket("udp4");
const PORT = process.env.PORT || 5003;

const DL_SET_SESSION    = 0x00;
const UL_CREATE_SESSION = 0x00;
const UL_UPLOAD_DATA    = 0x01;
const UL_UPLOAD_DECODER = 0x02;
const UL_UPLOAD_ENCODER = 0x03;
const UL_UPLOAD_CONFIG  = 0x04;
const UL_UPLOAD_STATS   = 0x05;
const FLAG_POLL_VALUE   = 0x01;
const FLAG_ACK_VALUE    = 0x02;

function buildSessionResponse(serialNumber, sequence) {
  const sessionType = Buffer.from([DL_SET_SESSION]);

  const ts = BigInt(Math.floor(Date.now() / 1000));
  const tsBuf = Buffer.alloc(9);
  tsBuf[0] = 0x1b;
  tsBuf.writeBigUInt64BE(ts, 1);

  const uint64_zero = Buffer.from([0x1b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

  const parts = [
    Buffer.from([0xbf]),
    cbor.encode(0x00), cbor.encode(1),
    cbor.encode(0x01), uint64_zero,
    cbor.encode(0x02), uint64_zero,
    cbor.encode(0x03), uint64_zero,
    cbor.encode(0x04), tsBuf,
    cbor.encode(0x05), cbor.encode("custom-server"),
    cbor.encode(0x06), cbor.encode("UDP Server"),
    Buffer.from([0xff]),
  ];

  const cborData = Buffer.concat(parts);
  const data = Buffer.concat([sessionType, cborData]);

  return packResponse(serialNumber, FLAG_FIRST | FLAG_LAST, sequence, data);
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
    const ackSequence = packet.sequence + 1;

    console.log(`[Server] Flags: ${packet.flags.toString(2).padStart(4,'0')}, seq: ${packet.sequence}, data_len: ${packet.data.length}`);

    // Ignoruj ACK pakety od zařízení
    if (packet.flags === FLAG_ACK_VALUE && packet.data.length === 0) {
      console.log("[Server] Device ACK — ignoring");
      return;
    }

    // POLL request
    if (packet.flags & FLAG_POLL_VALUE && packet.data.length === 0) {
      console.log("[Server] POLL request — sending session data");
      const sessionResp = buildSessionResponse(packet.serialNumber, ackSequence);
      server.send(sessionResp, rinfo.port, rinfo.address, (err) => {
        if (err) console.error("[Server] Session data failed:", err.message);
        else console.log("[Server] Session data sent");
      });
      return;
    }

    if (packet.data && packet.data.length > 0) {
      const msgType = packet.data[0];
      console.log(`[Server] Message type: 0x${msgType.toString(16).padStart(2,'0')}, data_len: ${packet.data.length}`);
      console.log(`[Server] Data hex (first 20 bytes): ${packet.data.slice(0, 20).toString("hex")}`);

      if (msgType === UL_CREATE_SESSION) {
        console.log("[Server] Session create — sending ACK+POLL");
        const ack = packResponse(packet.serialNumber, FLAG_ACK | FLAG_POLL, ackSequence, null);
        server.send(ack, rinfo.port, rinfo.address, (err) => {
          if (err) console.error("[Server] ACK+POLL failed:", err.message);
          else console.log("[Server] ACK+POLL sent");
        });
        return;
      }

      if ([UL_UPLOAD_DECODER, UL_UPLOAD_ENCODER, UL_UPLOAD_CONFIG, UL_UPLOAD_STATS].includes(msgType)) {
        console.log(`[Server] Upload type 0x${msgType.toString(16).padStart(2,'0')} — sending ACK`);
        const ack = packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null);
        server.send(ack, rinfo.port, rinfo.address, (err) => {
          if (err) console.error("[Server] ACK failed:", err.message);
          else console.log(`[Server] ACK sent for upload 0x${msgType.toString(16).padStart(2,'0')}`);
        });
        return;
      }

      if (msgType === UL_UPLOAD_DATA) {
        console.log("[Server] ✅ DATA PACKET received!");
        console.log("[Server] Full data hex:", packet.data.toString("hex"));
        const ack = packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null);
        server.send(ack, rinfo.port, rinfo.address, (err) => {
          if (err) console.error("[Server] ACK failed:", err.message);
          else console.log("[Server] ACK sent for data");
        });
        return;
      }
    }

    // Standardní ACK
    const ack = packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null);
    server.send(ack, rinfo.port, rinfo.address, (err) => {
      if (err) console.error("[Server] ACK failed:", err.message);
      else console.log(`[Server] ACK sent, seq=${ackSequence}`);
    });

  } catch (error) {
    console.error(`[UDP] Error: ${error.message}`);
  }
});