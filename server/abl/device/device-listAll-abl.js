import deviceListAllDao from "../../dao/device/device-listAll-dao.js";

async function deviceListAllAbl(userId) {
  return await deviceListAllDao(userId);
}

export default deviceListAllAbl;
