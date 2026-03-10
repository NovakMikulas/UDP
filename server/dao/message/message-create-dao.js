import MESSAGE_MODEL from "../../models/Message.js";
async function messageCreateDao(data) {
  return await MESSAGE_MODEL.create(data);
}
export default messageCreateDao;
