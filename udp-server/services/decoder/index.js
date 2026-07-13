import cbor from "cbor";
import { mapValue } from "./map-value.js";

// data = packet.dat from Cloud V2 protocol
// Byte 0: 0x06 (UL_UPLOAD_DATA)
// Bytes 1-8: decoder_hash
// Rest: CBOR payload
export const decodeMessage = async (data, serialNumber) => {
  const raw = data.slice(9); // skip type(1) + decoder_hash(8)
  try {
    const decoder = new cbor.Decoder({ mapsAsObjects: false });
    const chunks = [];
    await new Promise((resolve, reject) => {
      decoder.on("data", (val) => chunks.push(val));
      decoder.on("error", reject);
      decoder.on("end", resolve);
      decoder.end(raw);
    });

    const rawDecoded = chunks[0];
    const decoded = mapValue(rawDecoded);

    return {
      serialNumber: serialNumber.toString(),
      ...decoded,
    };
  } catch (error) {
    console.error(
      `[Decoder] Failed for device ${serialNumber}:`,
      error.message
    );
    throw error;
  }
};