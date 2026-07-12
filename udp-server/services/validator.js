// services/validator.js
import crypto from "crypto";

const HASH_SIZE = 8;
const SERIAL_SIZE = 4;
const HEADER_SIZE = 2;
const PACKET_MIN_SIZE = HASH_SIZE + SERIAL_SIZE + HEADER_SIZE;

const CLAIM_TOKEN = Buffer.from("f015d4fd88acb9f11ff7c68807603b33", "hex");

// Flags
export const FLAG_FIRST = 0x08;
export const FLAG_LAST  = 0x04;
export const FLAG_ACK   = 0x02;
export const FLAG_POLL  = 0x01;

function calculateHash(claimToken, data) {
  const hash = crypto.createHash("sha256");
  hash.update(claimToken);
  hash.update(data);
  const digest = hash.digest();
  
  const result = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    result[i] = digest[i] ^ digest[8 + i] ^ digest[16 + i] ^ digest[24 + i];
  }
  return result;
}

export function unpackPacket(msg) {
  if (msg.length < PACKET_MIN_SIZE) {
    throw new Error("Packet too short");
  }

  const receivedHash = msg.slice(0, HASH_SIZE);
  const dataForHash = msg.slice(HASH_SIZE);
  const calculatedHash = calculateHash(CLAIM_TOKEN, dataForHash);

  if (!receivedHash.equals(calculatedHash)) {
    throw new Error("Hash mismatch");
  }

  const serialNumber = msg.readUInt32BE(HASH_SIZE);
  const header = msg.readUInt16BE(HASH_SIZE + SERIAL_SIZE);
  const flags = (header >> 12) & 0x0F;
  const sequence = header & 0x0FFF;
  const data = msg.slice(PACKET_MIN_SIZE);

  return { serialNumber, flags, sequence, data };
}

export function packPacket(serialNumber, flags, sequence, data) {
  const dataLen = data ? data.length : 0;
  const buf = Buffer.alloc(PACKET_MIN_SIZE + dataLen);

  // Placeholder for hash
  buf.fill(0, 0, HASH_SIZE);
  
  // Serial number
  buf.writeUInt32BE(serialNumber, HASH_SIZE);
  
  // Header
  const header = ((flags & 0x0F) << 12) | (sequence & 0x0FFF);
  buf.writeUInt16BE(header, HASH_SIZE + SERIAL_SIZE);
  
  // Data
  if (data && dataLen > 0) {
    data.copy(buf, PACKET_MIN_SIZE);
  }

  // Calculate and write hash
  const hash = calculateHash(CLAIM_TOKEN, buf.slice(HASH_SIZE));
  hash.copy(buf, 0);

  return buf;
}

export const validateMessage = async (msg) => {
  try {
    const packet = unpackPacket(msg);
    console.log(`[Validator] Valid packet from device ${packet.serialNumber}, flags: ${packet.flags}, seq: ${packet.sequence}`);
    return packet;
  } catch (error) {
    console.error("[Validator] Message invalid:", error.message);
    return null;
  }
};