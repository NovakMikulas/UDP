import DEVICE_MODEL from "../../models/Device.js";
async function deviceCreateDao(data) {
  return await DEVICE_MODEL.create(data);
}
export default deviceCreateDao;
