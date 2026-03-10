import ROOM_MODEL from "../../models/Room.js";
async function roomUpdateDao(roomId, data) {
  return await ROOM_MODEL.findByIdAndUpdate(roomId, data, { new: true });
}
export default roomUpdateDao;
