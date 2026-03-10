import Ajv from "ajv";
const ajv = new Ajv();
import locationCreateDao from "../../dao/location/location-create-dao.js";
import ApiError from "../../utils/api-error.js";
const schema = {
  type: "object",
  properties: {
    owner_id: { type: "string" },
    authorized_users: { type: "array", items: { type: "string" } },
    name: { type: "string" },
    address: { type: "string" },
  },
  required: ["name", "address", "owner_id"],
};

async function locationCreateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  return await locationCreateDao(data);
}

export default locationCreateAbl;
