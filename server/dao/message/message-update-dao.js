import MESSAGE_MODEL from "../../models/Message.js";
async function messageUpdateDao(messageId, data) {
  return await MESSAGE_MODEL.findByIdAndUpdate(messageId, data, { new: true });
}
export default messageUpdateDao;
