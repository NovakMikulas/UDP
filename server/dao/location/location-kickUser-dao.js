import LOCATION_MODEL from "../../models/Location.js";

async function locationKickUserDao(locationId, userId) {
  return await LOCATION_MODEL.findByIdAndUpdate(
    locationId,
    { $pull: { members: userId } },
    { new: true },
  );
}

export default locationKickUserDao;
