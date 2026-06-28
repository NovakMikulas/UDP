import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import messageListDao from "../../dao/message/message-list-dao.js";

const schema = {
  type: "object",
  properties: {
    deviceId: { type: "string" },
    page: { type: "integer", minimum: 1 },
    limit: { type: "integer", minimum: 1, maximum: 100 },
  },
  required: ["deviceId"],
  additionalProperties: false,
};

async function messageListAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const page = data.page ?? 1;
  const limit = data.limit ?? 20;
  const { items, total } = await messageListDao(data.deviceId, page, limit);
  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}
export default messageListAbl;
