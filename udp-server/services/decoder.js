import cbor from "cbor";
import { mapValue } from "./map-value.js";

const LEN_SIZE = 2;
const HASH_SIZE = 6;
const SERIAL_NUMBER_SIZE = 4;
const LEN_HASH_SIZE = LEN_SIZE + HASH_SIZE;
const HEADER_SIZE = LEN_HASH_SIZE + SERIAL_NUMBER_SIZE;

export const decodeMessage = async (msg) => {
  const serialNumber = msg.readUInt32LE(LEN_HASH_SIZE);
  const raw = msg.slice(HEADER_SIZE);
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
      `[Decoder] Raw data from device ${serialNumber}:`,
      JSON.stringify(decoded),
    );

    return {
      serialNumber: serialNumber.toString(),
      ...decoded,
    };
  } catch (error) {
    console.error(
      `[Decoder] Failed for device ${serialNumber}:`,
      error.message,
    );
    throw error;
  }
};
