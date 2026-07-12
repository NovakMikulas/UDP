// services/decoder.js
import cbor from "cbor";
import { mapValue } from "./map-value.js";

// data = packet.data z Cloud v2 protokolu
// Byte 0: 0x06 (UL_UPLOAD_DATA)
// Byty 1-8: decoder_hash
// Zbytek: CBOR payload
export const decodeMessage = async (data, serialNumber) => {
  const raw = data.slice(9); // přeskoč type(1) + decoder_hash(8)
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

    console.log(
      `[Decoder] Data from device ${serialNumber}:`,
      JSON.stringify(decoded)
    );

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