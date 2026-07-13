import ApiError from "../../utils/api-error.js";
import deviceGetDao from "../../dao/device/device-get-dao.js";

async function deviceGetConfigAbl(deviceId) {
  const device = await deviceGetDao(deviceId);
  if (!device) {
    throw new ApiError(400, `[ABL] Device does not exist`);
  }
  return device.pendingConfig ?? null;
}

export default deviceGetConfigAbl;
