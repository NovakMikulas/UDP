import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import locationUpdateDao from "../../dao/location/location-update-dao.js";
import locationGetDao from "../../dao/location/location-get-dao.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    ownerId: { type: "string" },
    authorizedUsers: { type: "array", items: { type: "string" } },
    name: { type: "string" },
    address: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function locationUpdateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const location = await locationGetDao(data.id);
  if (!location) {
    throw new ApiError(400, `[ABL] Location does not exist`);
  }

  return await locationUpdateDao(data.id, data);
}
export default locationUpdateAbl;
