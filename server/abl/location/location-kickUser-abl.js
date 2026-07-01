import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import locationKickUserDao from "../../dao/location/location-kickUser-dao.js";
import locationGetDao from "../../dao/location/location-get-dao.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    userId: { type: "string" },
  },
  required: ["id", "userId"],
  additionalProperties: false,
};

async function locationKickUserAbl(data) {
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }

  const location = await locationGetDao(data.id);
  if (!location) {
    throw new ApiError(404, "[ABL] Location does not exist.");
  }

  if (location.owner.equals(data.userId)) {
    throw new ApiError(400, "[ABL] Cannot kick the owner of the location.");
  }

  const isMember = location.members.some((m) => m.equals(data.userId));
  if (!isMember) {
    throw new ApiError(404, "[ABL] User is not a member of this location.");
  }

  return await locationKickUserDao(data.id, data.userId);
}

export default locationKickUserAbl;
