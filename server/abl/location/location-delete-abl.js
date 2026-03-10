import Ajv from "ajv";
const ajv = new Ajv();
import locationDeleteDao from "../../dao/location/location-delete-dao.js";
import locationGetDao from "../../dao/location/location-get-dao.js";
import ApiError from "../../utils/api-error.js";
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function locationDeleteAbl(id) {
  const idObject = { id: id };
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

  await locationDeleteDao(id);
}
export default locationDeleteAbl;
