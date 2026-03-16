import LOCATION_MODEL from "../../models/Location.js";

async function locationListDao(userId) {
  return await LOCATION_MODEL.find({
    $or: [{ owner_id: userId }, { members: userId }],
  });
}
export default locationListDao;
