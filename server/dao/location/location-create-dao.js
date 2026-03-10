import LOCATION_MODEL from "../../models/Location.js";
async function locationCreateDao(data) {
  return await LOCATION_MODEL.create(data);
}
export default locationCreateDao;
