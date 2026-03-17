import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import deviceUpdateDao from "../../dao/device/device-update-dao.js";
import deviceGetDao from "../../dao/device/device-get-dao.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    roomId: { type: "string" },
    serialNumber: { type: "string" },
    name: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function deviceUpdateAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const device = await deviceGetDao(data.id);
  if (!device) {
    throw new ApiError(400, `[ABL] Device does not exist`);
  }

  return await deviceUpdateDao(data.id, data);
}
export default deviceUpdateAbl;
