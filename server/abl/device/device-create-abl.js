import Ajv from "ajv";
const ajv = new Ajv();
import deviceCreateDao from "../../dao/device/device-create-dao.js";
import ApiError from "../../utils/api-error.js";
const schema = {
  type: "object",
  properties: {
    roomId: { type: "string" },
    serialNumber: { type: "string" },
    name: { type: "string" },
  },
  required: ["name", "serialNumber", "roomId"],
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
