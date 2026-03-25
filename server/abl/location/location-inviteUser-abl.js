import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import locationInviteUserDao from "../../dao/location/location-inviteUser-dao.js";
import locationGetDao from "../../dao/location/location-get-dao.js";
import userGetDao from "../../dao/user/user-get-dao.js";
const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    userId: { type: "string" },
  },
  required: ["id", "userId"],
  additionalProperties: false,
};

async function locationInviteUserAbl(data) {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }
  const location = await locationGetDao(data.id);
  if (!location) {
    throw new ApiError(400, `[ABL] Location does not exist`);
  }
  const user = await userGetDao(data.userId);
  if (!user) {
    throw new ApiError(400, `[ABL] User does not exist`);
  }
  return await locationInviteUserDao(data.id, user._id);
}
export default locationInviteUserAbl;
