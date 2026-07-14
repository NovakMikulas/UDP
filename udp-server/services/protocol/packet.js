import crypto from "crypto";

export const FLAG_FIRST = 0x08;
export const FLAG_LAST  = 0x04;
export const FLAG_ACK   = 0x02;
export const FLAG_POLL  = 0x01;

export const DL_SET_SESSION    = 0x80;
export const UL_CREATE_SESSION = 0x00;
export const UL_UPLOAD_CONFIG  = 0x02;
export const UL_UPLOAD_DECODER = 0x03;
export const UL_UPLOAD_ENCODER = 0x04;
export const UL_UPLOAD_STATS   = 0x05;
export const UL_UPLOAD_DATA    = 0x06;

function calculateHash(data, claimToken) {
  if (!/^[0-9a-f]{32}$/.test(claimToken)) {
    throw new Error(`Invalid claim token: expected 32 lowercase hex characters, got "${claimToken}"`);
  }

  const h = crypto.createHash("sha256");
  h.update(Buffer.from(claimToken, "hex"));
  h.update(data);
  const d = h.digest();
  const result = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    result[i] = d[i] ^ d[8+i] ^ d[16+i] ^ d[24+i];
  }
  return result;
}


export function peekSerialNumber(msg) {
  const binary = Buffer.from(msg.toString("ascii"), "base64");

  if (binary.length < 12) {
    throw new Error("Packet too short");
  }

  return binary.readUInt32BE(8);
}

export function unpackPacketWithToken(msg, claimToken) {
  const binary = Buffer.from(msg.toString("ascii"), "base64");

  if (binary.length < 14) {
    throw new Error("Packet too short");
  }

  const receivedHash = binary.slice(0, 8);
  const calculatedHash = calculateHash(binary.slice(8), claimToken);

  if (!receivedHash.equals(calculatedHash)) {
    throw new Error(`Hash mismatch: expected ${calculatedHash.toString("hex")}, got ${receivedHash.toString("hex")}`);
  }

  const serialNumber = binary.readUInt32BE(8);
  const header = binary.readUInt16BE(12);
  const flags = (header >> 12) & 0x0F;
  const sequence = header & 0x0FFF;
  const data = binary.slice(14);

  return { serialNumber, flags, sequence, data, binary };
}

export function packResponse(serialNumber, flags, sequence, data, claimToken) {
  const dataLen = data ? data.length : 0;
  const binary = Buffer.alloc(14 + dataLen);

  binary.writeUInt32BE(serialNumber, 8);
  const header = ((flags & 0x0F) << 12) | (sequence & 0x0FFF);
  binary.writeUInt16BE(header, 12);

  if (data && dataLen > 0) {
    data.copy(binary, 14);
  }

  const hash = calculateHash(binary.slice(8), claimToken);
  hash.copy(binary, 0);

  return Buffer.from(binary.toString("base64"), "ascii");
}
