import dgram from "dgram";
import cbor from "cbor";
import crypto from "crypto";

const SERIAL_NUMBER = 123;

// Simulate battery voltage via CLI argument: node test-sender.js [voltage]
// Examples: 3.6 (full), 3.3 (low → downlink), 3.0 (critical → downlink), 2.5 (dead)
const voltage = parseFloat(process.argv[2]) || 3.6;

const client = dgram.createSocket("udp4");

const payload = cbor.encode({
  message: {
    version: 2,
    sequence: 1,
    timestamp: Math.floor(Date.now() / 1000),
  },
  system: {
    uptime: 86400,
    voltage_load: voltage - 0.4,
    voltage_rest: voltage,
    current_load: 38,
  },
  thermometer: {
    temperature: 23.5,
  },
  motion: {
    totalizer: {
      detect_left: 150,
      detect_right: 130,
      motion_left: 42,
      motion_right: 37,
    },
    samples: [
      Math.floor(Date.now() / 1000),
      [0, 3, 2, 1, 2],
      [60, 5, 4, 3, 1],
      [120, 2, 1, 0, 1],
    ],
  },
});

const serialBuf = Buffer.alloc(4);
serialBuf.writeUInt32LE(SERIAL_NUMBER);

const partToHash = Buffer.concat([serialBuf, payload]);
const hash = crypto.createHash("sha256").update(partToHash).digest().subarray(0, 6);

const totalLength = 2 + 6 + 4 + payload.length;
const lengthBuf = Buffer.alloc(2);
lengthBuf.writeUInt16LE(totalLength);

const finalPacket = Buffer.concat([lengthBuf, hash, serialBuf, payload]);

console.log(`Sending packet: serial=${SERIAL_NUMBER}, voltage=${voltage}V, in=4 (samples sum), out=4 (samples sum)`);

client.send(finalPacket, 4444, "localhost", (err) => {
  if (err) {
    console.error("Send failed:", err);
    client.close();
    return;
  }
  console.log("Packet sent, waiting for downlink response...");
});

client.on("message", (msg) => {
  try {
    const decoded = cbor.decodeFirstSync(msg);
    console.log("Downlink received:", JSON.stringify(decoded, null, 2));
  } catch {
    console.log("Downlink received (raw):", msg.toString("hex"));
  }
  client.close();
});

setTimeout(() => {
  console.log("No downlink received (timeout 3s)");
  client.close();
}, 3000);
