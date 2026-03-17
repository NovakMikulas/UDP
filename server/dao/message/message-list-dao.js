import MESSAGE_MODEL from "../../models/Message.js";

async function messageListDao(deviceId) {
  return await MESSAGE_MODEL.find({ deviceId: deviceId });
}
export default messageListDao;
