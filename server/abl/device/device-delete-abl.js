import Ajv from "ajv";
const ajv = new Ajv();
import deviceDeleteDao from "../../dao/device/device-delete-dao.js";
import deviceGetDao from "../../dao/device/device-get-dao.js";
import ApiError from "../../utils/api-error.js";
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function deviceDeleteAbl(id) {
  const idObject = { id: id };
  const validate = ajv.compile(schema);
  const valid = validate(idObject);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const device = await deviceGetDao(id);
  if (!device) {
    throw new ApiError(400, `[ABL] Device does not exist`);
  }

  await deviceDeleteDao(id);
}
export default deviceDeleteAbl;
