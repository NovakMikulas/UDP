import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import roomUpdateDao from "../../dao/room/room-update-dao.js";
import roomGetDao from "../../dao/room/room-get-dao.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    location_id: { type: "string" },
    name: { type: "string" },
    capacity: { type: "number" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function roomUpdateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const room = await roomGetDao(data.id);
  if (!room) {
    throw new ApiError(400, `[ABL] Room does not exist`);
  }

  return await roomUpdateDao(data.id, data);
}
export default roomUpdateAbl;
