import Ajv from "ajv";
import addFormats from "ajv-formats";
const ajv = new Ajv();
addFormats(ajv);
import userGetDao from "../../dao/user/user-get-dao.js";
import userCreateDao from "../../dao/user/user-create-dao.js";
import ApiError from "../../utils/api-error.js";
import { hashPassword } from "../../utils/hash-password.js";

const schema = {
  type: "object",
  properties: {
    username: { type: "string", minLength: 1 },
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 6 },
    confirmPassword: { type: "string" },
  },
  required: ["password", "confirmPassword", "username", "email"],
  additionalProperties: false,
};

async function userRegisterAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }

  if (data.password !== data.confirmPassword) {
    throw new ApiError(400, "[ABL] Passwords do not match.");
  }

  const existingUser = await userGetDao(data);
  if (existingUser) {
    throw new ApiError(400, `[ABL] User already exists.`);
  }

  const { confirmPassword, ...userData } = data;
  userData.password = await hashPassword(userData.password);
  await userCreateDao(userData);
}

export default userRegisterAbl;
