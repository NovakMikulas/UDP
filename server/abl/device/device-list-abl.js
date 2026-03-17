import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import deviceListDao from "../../dao/device/device-list-dao.js";

const schema = {
  type: "object",
  properties: {
    roomId: { type: "string" },
  },
  required: ["roomId"],
  additionalProperties: false,
};

async function deviceListAbl(roomId) {
  const roomObject = { roomId };
  const validate = ajv.compile(schema);
  const valid = validate(roomObject);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const devices = await deviceListDao(roomId);
  if (!devices) {
    throw new ApiError(400, `[ABL] No devices found for the specified room`);
  }
  return devices;
}
export default deviceListAbl;
