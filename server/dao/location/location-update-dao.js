import LOCATION_MODEL from "../../models/Location.js";
async function locationUpdateDao(locationId, data) {
  return await LOCATION_MODEL.findByIdAndUpdate(locationId, data, {
    new: true,
  });
}
export default locationUpdateDao;
