import DEVICE_MODEL from "../../models/Device.js";
async function deviceGetBySerialDao(serialNumber) {
  return await DEVICE_MODEL.findOne({ serialNumber });
}
export default deviceGetBySerialDao;
