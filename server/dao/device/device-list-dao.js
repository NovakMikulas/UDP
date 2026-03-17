import DEVICE_MODEL from "../../models/Device.js";

async function deviceListDao(roomId) {
  return await DEVICE_MODEL.find({ roomId: roomId });
}
export default deviceListDao;
