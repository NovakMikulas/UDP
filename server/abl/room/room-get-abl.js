import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import roomGetDao from "../../dao/room/room-get-dao.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function roomGetAbl(id) {
  const idObject = { id };
  const validate = ajv.compile(schema);
  const valid = validate(idObject);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const room = await roomGetDao(id);
  if (!room) {
    throw new ApiError(400, `[ABL] Room does not exist`);
  }
  return room;
}
export default roomGetAbl;
