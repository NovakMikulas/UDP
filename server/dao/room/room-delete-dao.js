import ROOM_MODEL from "../../models/Room.js";
async function roomDeleteDao(roomId) {
  return await ROOM_MODEL.deleteOne({ _id: roomId });
}
export default roomDeleteDao;
