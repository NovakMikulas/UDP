import Ajv from "ajv";
const ajv = new Ajv();
import messageCreateDao from "../../dao/message/message-create-dao.js";
import ApiError from "../../utils/api-error.js";
const schema = {
  type: "object",
  properties: {
    device_id: { type: "string" },
    in: { type: "number" },
    out: { type: "number" },
    battery: { type: "number" },
    timestamp: { type: "string", format: "date-time" },
  },
  required: ["device_id", "in", "out", "battery", "timestamp"],
};

async function messageCreateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  return await messageCreateDao(data);
}

export default messageCreateAbl;
