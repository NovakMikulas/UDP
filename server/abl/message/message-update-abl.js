import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import messageUpdateDao from "../../dao/message/message-update-dao.js";
import messageGetDao from "../../dao/message/message-get-dao.js";

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

async function messageUpdateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const message = await messageGetDao(data.id);
  if (!message) {
    throw new ApiError(400, `[ABL] Message does not exist`);
  }

  return await messageUpdateDao(data.id, data);
}
export default messageUpdateAbl;
