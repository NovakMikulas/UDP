import LOCATION_MODEL from "../../models/Location.js";

async function locationListDao(user_id) {
  return await LOCATION_MODEL.find({
    $or: [{ owner_id: user_id }, { members: user_id }],
  });
}
export default locationListDao;
