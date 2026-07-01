import Ajv from "ajv";
import addFormats from "ajv-formats";
const ajv = new Ajv();
addFormats(ajv);
import ApiError from "../../utils/api-error.js";
import locationGetDao from "../../dao/location/location-get-dao.js";
import userGetDao from "../../dao/user/user-get-dao.js";
import LOCATION_MODEL from "../../models/Location.js";

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    email: { type: "string", format: "email" },
  },
  required: ["id", "email"],
  additionalProperties: false,
};

async function locationInviteUserAbl(data) {
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    const message = validate.errors?.map((err) => err.message).join(", ");
    throw new ApiError(400, `[ABL] Validation failed: ${message}`);
  }

  const location = await locationGetDao(data.id);
  if (!location) {
    throw new ApiError(404, "[ABL] Location does not exist.");
  }

  const user = await userGetDao({ email: data.email });
  if (!user) {
    throw new ApiError(404, "[ABL] User with this email does not exist.");
  }

  const alreadyMember =
    location.owner.equals(user._id) ||
    location.members.some((m) => m.equals(user._id));
  if (alreadyMember) {
    throw new ApiError(409, "[ABL] User is already a member of this location.");
  }

  const alreadyInvited = location.invitations.some((inv) =>
    inv.userId.equals(user._id),
  );
  if (alreadyInvited) {
    throw new ApiError(409, "[ABL] User already has a pending invitation.");
  }

  return await LOCATION_MODEL.findByIdAndUpdate(
    data.id,
    { $push: { invitations: { userId: user._id } } },
    { new: true },
  );
}

export default locationInviteUserAbl;
