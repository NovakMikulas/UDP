import ApiError from "../../utils/api-error.js";
import locationGetDao from "../../dao/location/location-get-dao.js";
import LOCATION_MODEL from "../../models/Location.js";

async function locationInviteDecisionAbl(locationId, userId, accept) {
  const location = await locationGetDao(locationId);
  if (!location) {
    throw new ApiError(404, "[ABL] Location does not exist.");
  }

  const invitation = location.invitations.find((inv) =>
    inv.userId.equals(userId),
  );
  if (!invitation) {
    throw new ApiError(404, "[ABL] Invitation not found.");
  }

  const update = { $pull: { invitations: { userId } } };
  if (accept) update.$push = { members: userId };

  return await LOCATION_MODEL.findByIdAndUpdate(locationId, update, {
    new: true,
  });
}

export default locationInviteDecisionAbl;
