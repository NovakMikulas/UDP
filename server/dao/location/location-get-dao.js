import LOCATION_MODEL from "../../models/Location.js";
async function locationGetDao(locationId) {
  return await LOCATION_MODEL.findById(locationId);
}
export default locationGetDao;
