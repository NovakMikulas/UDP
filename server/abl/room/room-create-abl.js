import Ajv from "ajv";
const ajv = new Ajv();
import roomCreateDao from "../../dao/room/room-create-dao.js";
import ApiError from "../../utils/api-error.js";
const schema = {
  type: "object",
  properties: {
    locationId: { type: "string" },
    name: { type: "string" },
    capacity: { type: "number" },
  },
  required: ["name", "locationId", "capacity"],
};

async function roomCreateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  return await roomCreateDao(data);
}

export default roomCreateAbl;
