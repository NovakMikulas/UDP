import Ajv from "ajv";
import addFormats from "ajv-formats";
const ajv = new Ajv();
addFormats(ajv);
import messageCreateDao from "../../dao/message/message-create-dao.js";
import deviceGetBySerialDao from "../../dao/device/device-getBySerial-dao.js";
import roomGetDao from "../../dao/room/room-get-dao.js";
import ApiError from "../../utils/api-error.js";
import { emitToLocation } from "../../socket/sender.js";
const schema = {
  type: "object",
  properties: {
    serialNumber: { type: "string" },
    in: { type: "number" },
    out: { type: "number" },
    battery: { type: "number" },
  },
  required: ["serialNumber", "in", "out", "battery"],
};

async function messageCreateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  const device = await deviceGetBySerialDao(data.serialNumber);
  if (!device) {
    throw new ApiError(
      404,
      `[ABL] Device with serial number ${data.serialNumber} not found`,
    );
  }

  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const processedData = {
    ...data,
    deviceId: device._id,
  };
  const message = await messageCreateDao(processedData);

  const room = await roomGetDao(device.roomId);
  if (room) {
    emitToLocation(room.locationId, "new_message", message);
  }

  return message;
}

export default messageCreateAbl;
