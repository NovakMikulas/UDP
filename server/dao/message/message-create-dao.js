import MESSAGE_MODEL from "../../models/Message.js";
import ApiError from "../../utils/api-error.js";

async function messageCreateDao(data) {
  try {
    return await MESSAGE_MODEL.create(data);
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, `[DAO] Duplicate message for device ${data.deviceId}, sequence ${data.message?.sequence}`);
    }
    throw error;
  }
}
export default messageCreateDao;
