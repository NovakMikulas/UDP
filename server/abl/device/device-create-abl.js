import Ajv from "ajv";
const ajv = new Ajv();
import deviceCreateDao from "../../dao/device/device-create-dao.js";
import ApiError from "../../utils/api-error.js";
const schema = {
  type: "object",
  properties: {
    room_id: { type: "string" },
    serial_number: { type: "string" },
    name: { type: "string" },
  },
  required: ["name", "serial_number", "room_id"],
};

async function deviceCreateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  return await deviceCreateDao(data);
}

export default deviceCreateAbl;
