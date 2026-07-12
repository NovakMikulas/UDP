// services/validator.js
import crypto from "crypto";

const CLAIM_TOKEN = Buffer.from(process.env.CLAIM_TOKEN || "f015d4fd88acb9f11ff7c68807603b33", "hex");

export const FLAG_FIRST = 0x08;
export const FLAG_LAST  = 0x04;
export const FLAG_ACK   = 0x02;
export const FLAG_POLL  = 0x01;

function calculateHash(data) {
  const h = crypto.createHash("sha256");
  h.update(CLAIM_TOKEN);
  h.update(data);
  const d = h.digest();
  const result = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    result[i] = d[i] ^ d[8+i] ^ d[16+i] ^ d[24+i];
  }
  return result;
}

export function unpackPacket(msg) {
  // Dekóduj base64
  const binary = Buffer.from(msg.toString("ascii"), "base64");

  if (binary.length < 14) {
    throw new Error("Packet too short");
  }

  const receivedHash = binary.slice(0, 8);
  const calculatedHash = calculateHash(binary.slice(8));

  if (!receivedHash.equals(calculatedHash)) {
    throw new Error(`Hash mismatch: expected ${calculatedHash.toString("hex")}, got ${receivedHash.toString("hex")}`);
  }

  const serialNumber = binary.readUInt32BE(8);
  const header = binary.readUInt16BE(12);
  const flags = (header >> 12) & 0x0F;
  const sequence = header & 0x0FFF;
  const data = binary.slice(14);

  console.log(`[Validator] Valid packet: serial=${serialNumber}, flags=${flags.toString(2).padStart(4,'0')}, seq=${sequence}, data_len=${data.length}`);

  return { serialNumber, flags, sequence, data, binary };
}

export function packResponse(serialNumber, flags, sequence, data) {
  const dataLen = data ? data.length : 0;
  const binary = Buffer.alloc(14 + dataLen);

  binary.writeUInt32BE(serialNumber, 8);
  const header = ((flags & 0x0F) << 12) | (sequence & 0x0FFF);
  binary.writeUInt16BE(header, 12);

  if (data && dataLen > 0) {
    data.copy(binary, 14);
  }

  const hash = calculateHash(binary.slice(8));
  hash.copy(binary, 0);

  return Buffer.from(binary.toString("base64"), "ascii");
}