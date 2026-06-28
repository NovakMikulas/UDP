import Ajv from "ajv";
import addFormats from "ajv-formats";
const ajv = new Ajv();
addFormats(ajv);
import userUpdateDao from "../../dao/user/user-update-dao.js";
import userGetDao from "../../dao/user/user-get-dao.js";
import ApiError from "../../utils/api-error.js";

const schema = {
  type: "object",
  properties: {
    username: { type: "string", minLength: 1 },
    email: { type: "string", format: "email" },
  },
  anyOf: [{ required: ["username"] }, { required: ["email"] }],
  additionalProperties: false,
};

async function userUpdateAbl(userId, data) {
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }

  if (data.username) {
    const existing = await userGetDao({ username: data.username });
    if (existing && existing._id.toString() !== userId) {
      throw new ApiError(409, "[ABL] Username is already taken.");
    }
  }

  if (data.email) {
    const existing = await userGetDao({ email: data.email });
    if (existing && existing._id.toString() !== userId) {
      throw new ApiError(409, "[ABL] Email is already in use.");
    }
  }

  return await userUpdateDao(userId, data);
}

export default userUpdateAbl;
