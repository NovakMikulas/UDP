import dgram from "dgram";
import cbor from "cbor";
import crypto from "crypto";

const SERIAL_NUMBER = 123;

const client = dgram.createSocket("udp4");

const payload = cbor.encode({
  in: 10,
  out: 4,
  battery: 100,
  timestamp: new Date().toISOString(),
});

const serialBuf = Buffer.alloc(4);
serialBuf.writeUInt32LE(SERIAL_NUMBER);

const partToHash = Buffer.concat([serialBuf, payload]);
const hash = crypto.createHash("sha256").update(partToHash).digest().subarray(0, 6);

const totalLength = 2 + 6 + 4 + payload.length;
const lengthBuf = Buffer.alloc(2);
lengthBuf.writeUInt16LE(totalLength);

const finalPacket = Buffer.concat([lengthBuf, hash, serialBuf, payload]);

client.send(finalPacket, 4444, "localhost", (err) => {
  if (err) console.error(err);
  else console.log(`Test packet sent with serialNumber: ${SERIAL_NUMBER}`);
  client.close();
});
