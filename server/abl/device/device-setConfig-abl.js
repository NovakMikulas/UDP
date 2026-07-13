import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import deviceGetDao from "../../dao/device/device-get-dao.js";
import deviceUpdateDao from "../../dao/device/device-update-dao.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    interval_sample: { type: "integer", minimum: 1, maximum: 86400 },
    interval_report: { type: "integer", minimum: 30, maximum: 86400 },
    interval_poll: { type: "integer", minimum: 0, maximum: 86400 },
    sensitivity: { type: "string", enum: ["low", "medium", "high", "individual"] },
    motion_sens: { type: "integer", minimum: 1, maximum: 255 },
    motion_blind: { type: "integer", minimum: 0, maximum: 10 },
    motion_pulse: { type: "integer", minimum: 1, maximum: 10 },
    motion_window: { type: "integer", minimum: 0, maximum: 10 },
  },
  required: ["id"],
  additionalProperties: false,
};

async function deviceSetConfigAbl(data) {
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

  const { id, ...configFields } = data;
  if (Object.keys(configFields).length === 0) {
    return await deviceUpdateDao(id, { $unset: { pendingConfig: 1 } });
  }
  return await deviceUpdateDao(id, { pendingConfig: configFields });
}

export default deviceSetConfigAbl;
