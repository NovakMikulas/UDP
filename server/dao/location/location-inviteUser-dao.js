import LOCATION_MODEL from "../../models/Location.js";
async function locationInviteUserDao(locationId, userId) {
  return await LOCATION_MODEL.findByIdAndUpdate(
    locationId,
    { $push: { members: userId } },
    { new: true },
  );
}
export default locationInviteUserDao;
