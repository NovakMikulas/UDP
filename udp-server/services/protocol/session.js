import cbor from "cbor";
import { packResponse, FLAG_FIRST, FLAG_LAST, DL_SET_SESSION } from "./packet.js";

export function buildSessionResponse(serialNumber, sequence) {
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
