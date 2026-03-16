import DEVICE_MODEL from "../../models/Device.js";

async function deviceListDao(roomId) {
    return await DEVICE_MODEL.find({ room_id: roomId });
}
export default deviceListDao;
