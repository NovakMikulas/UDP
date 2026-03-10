import LOCATION_MODEL from "../../models/Location.js";
async function locationDeleteDao(locationId) {
  return await LOCATION_MODEL.findByIdAndDelete(locationId);
}
export default locationDeleteDao;
