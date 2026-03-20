import LOCATION_MODEL from "../../models/Location.js";

async function locationListDao(userId) {
  return await LOCATION_MODEL.find({
    $or: [{ owner: userId }, { members: userId }],
  })
    .populate("owner", "username email")
    .populate("members", "username email");
}
export default locationListDao;
