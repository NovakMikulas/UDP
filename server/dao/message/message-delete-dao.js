import MESSAGE_MODEL from "../../models/Message.js";
async function messageDeleteDao(messageId) {
  return await MESSAGE_MODEL.findByIdAndDelete(messageId);
}
export default messageDeleteDao;
