import DEVICE_MODEL from "../../models/Device.js";

async function deviceListDao(roomId) {
  return await DEVICE_MODEL.find({ roomId: roomId }).populate({
    path: "roomId",
    populate: { path: "locationId", select: "name" },
  });
}
export default deviceListDao;
