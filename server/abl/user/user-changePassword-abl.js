import Ajv from "ajv";
const ajv = new Ajv();
import USER_MODEL from "../../models/User.js";
import userUpdateDao from "../../dao/user/user-update-dao.js";
import ApiError from "../../utils/api-error.js";
import { verifyPassword, hashPassword } from "../../utils/hash-password.js";

const schema = {
  type: "object",
  properties: {
    currentPassword: { type: "string" },
    newPassword: { type: "string", minLength: 6 },
    confirmPassword: { type: "string" },
  },
  required: ["currentPassword", "newPassword", "confirmPassword"],
  additionalProperties: false,
};

async function userChangePasswordAbl(userId, data) {
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }

  if (data.newPassword !== data.confirmPassword) {
    throw new ApiError(400, "[ABL] Passwords do not match.");
  }

  const user = await USER_MODEL.findById(userId);
  if (!user || !(await verifyPassword(data.currentPassword, user.password))) {
    throw new ApiError(401, "[ABL] Current password is incorrect.");
  }

  await userUpdateDao(userId, { password: await hashPassword(data.newPassword) });
}

export default userChangePasswordAbl;
