export const FLAG_FIRST = 0x08;
export const FLAG_LAST  = 0x04;
export const FLAG_ACK   = 0x02;
export const FLAG_POLL  = 0x01;

export function unpackPacket(msg) {
  // Dekóduj base64
  const binary = Buffer.from(msg.toString("ascii"), "base64");
  
  const serialNumber = binary.readUInt32BE(8);
  const header = binary.readUInt16BE(12);
  const flags = (header >> 12) & 0x0F;
  const sequence = header & 0x0FFF;
  const data = binary.slice(14);

  console.log(`[Validator] Packet: serial=${serialNumber}, flags=${flags.toString(2).padStart(4,'0')}, seq=${sequence}, data_len=${data.length}`);
  
  return { serialNumber, flags, sequence, data, binary };
}

export function packResponse(serialNumber, flags, sequence) {
  const buf = Buffer.alloc(14);
  buf.writeUInt32BE(serialNumber, 8);
  const header = ((flags & 0x0F) << 12) | (sequence & 0x0FFF);
  buf.writeUInt16BE(header, 12);
  // Hash necháme jako nuly - uvidíme co zařízení udělá
  return Buffer.from(buf.toString("base64"), "ascii");
}