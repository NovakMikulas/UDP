// test-sender.js
import dgram from "dgram";
import cbor from "cbor";
import crypto from "crypto";

const client = dgram.createSocket("udp4");

// 1. Data musí obsahovat vše, co tvé AJV vyžaduje
const payload = cbor.encode({
  in: 10,
  out: 4,
  battery: 100,
  timestamp: new Date().toISOString(),
  device_id: "507f1f77bcf86cd799439011", // Náhodný MongoDB ObjectId string
});

const serialNumber = Buffer.alloc(4);
serialNumber.writeUInt32LE(12345678);

const partToHash = Buffer.concat([serialNumber, payload]);
const hash = crypto
  .createHash("sha256")
  .update(partToHash)
  .digest()
  .slice(0, 6);

const totalLength = 2 + 6 + 4 + payload.length;
const lengthBuf = Buffer.alloc(2);
lengthBuf.writeUInt16LE(totalLength);

const finalPacket = Buffer.concat([lengthBuf, hash, serialNumber, payload]);

client.send(finalPacket, 4444, "localhost", (err) => {
  if (err) console.error(err);
  else console.log("📤 Testovací paket odeslán s device_id!");
  client.close();
});
