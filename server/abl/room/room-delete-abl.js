import Ajv from "ajv";
const ajv = new Ajv();
import roomDeleteDao from "../../dao/room/room-delete-dao.js";
import roomGetDao from "../../dao/room/room-get-dao.js";
import ApiError from "../../utils/api-error.js";
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function roomDeleteAbl(id) {
  const idObject = { id: id };
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

  await roomDeleteDao(id);
}
export default roomDeleteAbl;
