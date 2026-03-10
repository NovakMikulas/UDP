import DEVICE_MODEL from "../../models/Device.js";
async function deviceUpdateDao(deviceId, data) {
  return await DEVICE_MODEL.findByIdAndUpdate(deviceId, data, {
    new: true,
  });
}
export default deviceUpdateDao;
