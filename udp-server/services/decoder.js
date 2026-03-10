import cbor from "cbor";
const LEN_SIZE = 2;
const HASH_SIZE = 6;
const SERIAL_NUMBER_SIZE = 4;
const LEN_HASH_SIZE = LEN_SIZE + HASH_SIZE;
const HEADER_SIZE = LEN_HASH_SIZE + SERIAL_NUMBER_SIZE;

export const decodeMessage = async (msg) => {
  const serialNumber = msg.readUInt32LE(LEN_HASH_SIZE);
  const raw = msg.slice(HEADER_SIZE);
  try {
    //DECODE RAW WITH CBOR
    const decodedRawData = cbor.decodeFirstSync(raw);
    console.log(`[Decoder] Data from device: ${serialNumber}:`, decodedRawData);

    //STRUCTURE DATA
    const processedData = {
      device_id: decodedRawData.device_id,
      serialNumber: serialNumber,
      in: decodedRawData.in || 0,
      out: decodedRawData.out || 0,
      battery: decodedRawData.battery || 0,
      timestamp: new Date().toISOString(),
    };
    return processedData;
  } catch (error) {
    console.error(`Decoder failed for device: ${serialNumber}:`, error.message);
    throw error;
  }
};
