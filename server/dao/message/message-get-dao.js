import MESSAGE_MODEL from "../../models/Message.js";
async function messageGetDao(messageId) {
  return await MESSAGE_MODEL.findById(messageId);
}
export default messageGetDao;
