import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import messageGetDao from "../../dao/message/message-get-dao.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function messageGetAbl(id) {
  const idObject = { id };
  const validate = ajv.compile(schema);
  const valid = validate(idObject);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const message = await messageGetDao(id);
  if (!message) {
    throw new ApiError(400, `[ABL] Message does not exist`);
  }
  return message;
}
export default messageGetAbl;
