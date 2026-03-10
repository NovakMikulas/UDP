import DEVICE_MODEL from "../../models/Device.js";
async function deviceGetDao(deviceId) {
  return await DEVICE_MODEL.findById(deviceId);
}
export default deviceGetDao;
