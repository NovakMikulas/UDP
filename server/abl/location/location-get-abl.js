import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import locationGetDao from "../../dao/location/location-get-dao.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function locationGetAbl(id) {
  const idObject = { id };
  const validate = ajv.compile(schema);
  const valid = validate(idObject);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const location = await locationGetDao(id);
  if (!location) {
    throw new ApiError(400, `[ABL] Location does not exist`);
  }
  return location;
}
export default locationGetAbl;
