import Ajv from "ajv";
const ajv = new Ajv();
import userGetDao from "../../dao/user/user-get-dao.js";
import userCreateDao from "../../dao/user/user-create-dao.js";
import ApiError from "../../utils/api-error.js";
import { hashPassword } from "../../utils/hash-password.js";

const schema = {
  type: "object",
  properties: {
    username: { type: "string", minLength: 1 },
    email: { type: "string" },
    password: { type: "string", minLength: 6 },
  },
  required: ["password", "username", "email"],
};

async function userRegisterAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }

  const existingUser = await userGetDao(data);
  if (existingUser) {
    throw new ApiError(400, `[ABL] User already exists.`);
  }

  data.password = await hashPassword(data.password);
  await userCreateDao(data);
}

export default userRegisterAbl;
