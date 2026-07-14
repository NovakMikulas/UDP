import Ajv from "ajv";
const ajv = new Ajv();
import deviceCreateDao from "../../dao/device/device-create-dao.js";
import roomGetDao from "../../dao/room/room-get-dao.js";
import ApiError from "../../utils/api-error.js";
// udp-server can only ever look devices up by String(uint32), since that's
// what the wire protocol's serial number field actually is - so this must be
// a plain non-negative integer string within uint32 range, or the device can
// never be matched to its real packets.
const MAX_UINT32 = 2 ** 32 - 1;

const schema = {
  type: "object",
  properties: {
    roomId: { type: "string" },
    serialNumber: { type: "string", pattern: "^[0-9]+$" },
    invertDirection: { type: "boolean" },
    claimToken: { type: "string" },
    locationId: { type: "string" },
  },
  required: ["serialNumber", "roomId", "claimToken", "locationId"],
  additionalProperties: false,
};

async function deviceCreateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }

  const normalizedSerialNumber = String(parseInt(data.serialNumber, 10));
  if (Number(normalizedSerialNumber) > MAX_UINT32) {
    throw new ApiError(400, `[ABL] Serial number exceeds the maximum allowed value (${MAX_UINT32}).`);
  }

  const room = await roomGetDao(data.roomId);
  if (!room || room.locationId.toString() !== data.locationId.toString()) {
    throw new ApiError(403, "[ABL] Room does not belong to the specified location.");
  }

  const { locationId, ...deviceData } = data;
  return await deviceCreateDao({ ...deviceData, serialNumber: normalizedSerialNumber });
}

export default deviceCreateAbl;
