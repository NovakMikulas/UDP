import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import deviceGetDao from "../../dao/device/device-get-dao.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function deviceGetAbl(id) {
  const idObject = { id };
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
  return device;
}
export default deviceGetAbl;
