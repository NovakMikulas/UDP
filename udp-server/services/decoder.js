import cbor from "cbor";

export const decodeMessage = async (data) => {
  const { serial_number, raw, timestamp } = data;

  try {
    //DECODE WITH CBOR
    const decoded = cbor.decodeFirstSync(raw);
    console.log(`[Decoder] Data from device: ${serial_number}:`, decoded);

    //STRUCTURE DATA
    const processedData = {
      serial_number: serial_number,
      in: decoded.in || 0,
      out: decoded.out || 0,
      battery: decoded.v || null,
      timestamp: new Date(timestamp * 1000),
    };
    return processedData;
  } catch (error) {
    console.error(
      `Decoder failed for device: ${serial_number}:`,
      error.message,
    );
    throw error;
  }
};
