import ROOM_MODEL from "../../models/Room.js";
async function roomCreateDao(data) {
  return await ROOM_MODEL.create(data);
}
export default roomCreateDao;
