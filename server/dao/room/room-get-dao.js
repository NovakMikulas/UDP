import ROOM_MODEL from "../../models/Room.js";
async function roomGetDao(roomId) {
  return await ROOM_MODEL.findById(roomId);
}
export default roomGetDao;
