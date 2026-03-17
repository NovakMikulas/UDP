import ROOM_MODEL from "../../models/Room.js";

async function roomListDao(locationId) {
  return await ROOM_MODEL.find({ locationId: locationId });
}
export default roomListDao;
