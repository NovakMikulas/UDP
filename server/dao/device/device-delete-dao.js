import DEVICE_MODEL from "../../models/Device.js";
async function deviceDeleteDao(deviceId) {
  return await DEVICE_MODEL.deleteOne({ _id: deviceId });
}
export default deviceDeleteDao;
