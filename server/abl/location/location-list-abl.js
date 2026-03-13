import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import locationListDao from "../../dao/location/location-list-dao.js";

const schema = {
  type: "object",
  properties: {
    user_id: { type: "string" },
  },
  required: ["user_id"],
  additionalProperties: false,
};

async function locationListAbl(user_id) {
  const userObject = { user_id: user_id };
  const validate = ajv.compile(schema);
  const valid = validate(userObject);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const locations = await locationListDao(user_id);
  if (!locations) {
    throw new ApiError(400, `[ABL] No locations found for the specified user`);
  }
  return locations;
}
export default locationListAbl;
