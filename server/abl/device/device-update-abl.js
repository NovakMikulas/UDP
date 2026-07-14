import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import deviceUpdateDao from "../../dao/device/device-update-dao.js";
import deviceGetDao from "../../dao/device/device-get-dao.js";
import roomGetDao from "../../dao/room/room-get-dao.js";

// udp-server can only ever look devices up by String(uint32), since that's
// what the wire protocol's serial number field actually is - so this must be
// a plain non-negative integer string within uint32 range, or the device can
// never be matched to its real packets.
const MAX_UINT32 = 2 ** 32 - 1;

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    locationId: { type: "string" },
    roomId: { type: "string" },
    serialNumber: { type: "string", pattern: "^[0-9]{10,}$" },
    name: { type: "string" },
    invertDirection: { type: "boolean" },
    claimToken: { type: "string", pattern: "^[0-9a-f]{32}$" },
  },
  required: ["id", "claimToken", "locationId"],
  additionalProperties: false,
};

async function deviceUpdateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const device = await deviceGetDao(data.id);
  if (!device) {
    throw new ApiError(400, `[ABL] Device does not exist`);
  }

  const { locationId, ...updateData } = data;

  if (updateData.serialNumber !== undefined) {
    const normalizedSerialNumber = String(parseInt(updateData.serialNumber, 10));
    if (Number(normalizedSerialNumber) > MAX_UINT32) {
      throw new ApiError(400, `[ABL] Serial number exceeds the maximum allowed value (${MAX_UINT32}).`);
    }
    updateData.serialNumber = normalizedSerialNumber;
  }

  if (updateData.roomId !== undefined) {
    const room = await roomGetDao(updateData.roomId);
    if (!room || room.locationId.toString() !== locationId.toString()) {
      throw new ApiError(403, "[ABL] Room does not belong to the specified location.");
    }
  }

  return await deviceUpdateDao(data.id, updateData);
}
export default deviceUpdateAbl;
