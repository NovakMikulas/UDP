import dgram from "dgram";
import cbor from "cbor";
import crypto from "crypto";

const SERIAL_NUMBER = 2159019999;

// Sends a packet encoded EXACTLY like the real CHESTER Motion firmware (numeric CBOR
// keys from app_codec.h, scaled integers), unlike test-sender.js which uses string keys.
//
// Usage: node test-sender2.js [voltage] [--omit=field1,field2,...]
// Examples:
//   node test-sender2.js 3.6
//   node test-sender2.js 3.2 --omit=network,accelerometer
//   node test-sender2.js 3.6 --omit=motion   (triggers the AJV "motion is required" 400 on the server)
const args = process.argv.slice(2);
const voltage = parseFloat(args[0]) || 3.6;
const omitArg = args.find((a) => a.startsWith("--omit="));
const omit = new Set(omitArg ? omitArg.slice("--omit=".length).split(",").filter(Boolean) : []);

// Matches udp-server/services/decoder.js KEY_MAP (derived from app_codec.h)
const KEY = {
  MESSAGE: 0, MESSAGE__VERSION: 1, MESSAGE__SEQUENCE: 2, MESSAGE__TIMESTAMP: 3,
  SYSTEM: 4, SYSTEM__UPTIME: 5, SYSTEM__VOLTAGE_LOAD: 6, SYSTEM__VOLTAGE_REST: 7, SYSTEM__CURRENT_LOAD: 8,
  NETWORK: 9, NETWORK__PARAMETER: 10,
  NETWORK__PARAMETER__EEST: 11, NETWORK__PARAMETER__ECL: 12, NETWORK__PARAMETER__RSRP: 13,
  NETWORK__PARAMETER__RSRQ: 14, NETWORK__PARAMETER__SNR: 15, NETWORK__PARAMETER__PLMN: 16,
  NETWORK__PARAMETER__CID: 17, NETWORK__PARAMETER__BAND: 18, NETWORK__PARAMETER__EARFCN: 19,
  THERMOMETER: 20, THERMOMETER__TEMPERATURE: 21,
  ACCELEROMETER: 22, ACCELEROMETER__ACCEL_X: 23, ACCELEROMETER__ACCEL_Y: 24, ACCELEROMETER__ACCEL_Z: 25, ACCELEROMETER__ORIENTATION: 26,
  MOTION: 27, MOTION__TOTALIZER: 28,
  MOTION__TOTALIZER__DETECT_LEFT: 29, MOTION__TOTALIZER__DETECT_RIGHT: 30, MOTION__TOTALIZER__MOTION_LEFT: 31, MOTION__TOTALIZER__MOTION_RIGHT: 32,
  MOTION__SAMPLES: 33,
};

const now = Math.floor(Date.now() / 1000);
const message = new Map();

if (!omit.has("message")) {
  message.set(KEY.MESSAGE, new Map([
    [KEY.MESSAGE__VERSION, 2],
    [KEY.MESSAGE__SEQUENCE, 1],
    [KEY.MESSAGE__TIMESTAMP, now],
  ]));
}

if (!omit.has("system")) {
  message.set(KEY.SYSTEM, new Map([
    [KEY.SYSTEM__UPTIME, 86400],
    [KEY.SYSTEM__VOLTAGE_LOAD, Math.round((voltage - 0.4) * 1000)], // mV
    [KEY.SYSTEM__VOLTAGE_REST, Math.round(voltage * 1000)], // mV
    [KEY.SYSTEM__CURRENT_LOAD, 38], // mA, not scaled on the wire
  ]));
}

if (!omit.has("network")) {
  message.set(KEY.NETWORK, new Map([
    [KEY.NETWORK__PARAMETER, new Map([
      [KEY.NETWORK__PARAMETER__EEST, 7],
      [KEY.NETWORK__PARAMETER__ECL, 0],
      [KEY.NETWORK__PARAMETER__RSRP, -87],
      [KEY.NETWORK__PARAMETER__RSRQ, -6],
      [KEY.NETWORK__PARAMETER__SNR, 12],
      [KEY.NETWORK__PARAMETER__PLMN, 23003],
      [KEY.NETWORK__PARAMETER__CID, 2851843],
      [KEY.NETWORK__PARAMETER__BAND, 20],
      [KEY.NETWORK__PARAMETER__EARFCN, 6300],
    ])],
  ]));
}

if (!omit.has("thermometer")) {
  message.set(KEY.THERMOMETER, new Map([
    [KEY.THERMOMETER__TEMPERATURE, Math.round(23.45 * 100)],
  ]));
}

if (!omit.has("accelerometer")) {
  message.set(KEY.ACCELEROMETER, new Map([
    [KEY.ACCELEROMETER__ACCEL_X, Math.round(0.02 * 1000)],
    [KEY.ACCELEROMETER__ACCEL_Y, Math.round(-0.01 * 1000)],
    [KEY.ACCELEROMETER__ACCEL_Z, Math.round(9.81 * 1000)],
    [KEY.ACCELEROMETER__ORIENTATION, 2],
  ]));
}

if (!omit.has("motion")) {
  message.set(KEY.MOTION, new Map([
    [KEY.MOTION__TOTALIZER, new Map([
      [KEY.MOTION__TOTALIZER__DETECT_LEFT, 150],
      [KEY.MOTION__TOTALIZER__DETECT_RIGHT, 130],
      [KEY.MOTION__TOTALIZER__MOTION_LEFT, 42],
      [KEY.MOTION__TOTALIZER__MOTION_RIGHT, 37],
    ])],
    [KEY.MOTION__SAMPLES, [
      now,             // absolute start timestamp
      0, 3, 2, 1, 2,     // offset, detect_left, detect_right, motion_left, motion_right
      60, 5, 4, 2, 3,
      120, 2, 1, 0, 1,
    ]],
  ]));
}

const payload = cbor.encode(message);

const serialBuf = Buffer.alloc(4);
serialBuf.writeUInt32LE(SERIAL_NUMBER);

const partToHash = Buffer.concat([serialBuf, payload]);
const hash = crypto.createHash("sha256").update(partToHash).digest().subarray(0, 6);

const totalLength = 2 + 6 + 4 + payload.length;
const lengthBuf = Buffer.alloc(2);
lengthBuf.writeUInt16LE(totalLength);

const finalPacket = Buffer.concat([lengthBuf, hash, serialBuf, payload]);

const client = dgram.createSocket("udp4");

console.log(
  `Sending real-format packet: serial=${SERIAL_NUMBER}, voltage=${voltage}V` +
  (omit.size ? `, omitting: ${[...omit].join(", ")}` : ""),
);

client.send(finalPacket, 4444, "localhost", (err) => {
  if (err) {
    console.error("Send failed:", err);
    client.close();
    return;
  }
  console.log("Packet sent, waiting for downlink response...");
});

const timeout = setTimeout(() => {
  console.log("No downlink received (timeout 3s)");
  client.close();
}, 3000);

client.on("message", (msg) => {
  clearTimeout(timeout);
  try {
    const decoded = cbor.decodeFirstSync(msg);
    console.log("Downlink received (numeric keys):", decoded);
  } catch {
    console.log("Downlink received (raw):", msg.toString("hex"));
  }
  client.close();
});
