import MESSAGE_MODEL from "../../models/Message.js";

async function messageListDao(deviceId) {
    return await MESSAGE_MODEL.find({ device_id: deviceId });
}
export default messageListDao;
