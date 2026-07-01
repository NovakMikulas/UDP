import LOCATION_MODEL from "../../models/Location.js";
import ROOM_MODEL from "../../models/Room.js";
import DEVICE_MODEL from "../../models/Device.js";

async function deviceListAllDao(userId) {
  const locations = await LOCATION_MODEL.find({
    $or: [{ owner: userId }, { members: userId }],
  }, "_id");

  const locationIds = locations.map((l) => l._id);

  const rooms = await ROOM_MODEL.find(
    { locationId: { $in: locationIds } },
    "_id",
  );

  const roomIds = rooms.map((r) => r._id);

  return await DEVICE_MODEL.find({ roomId: { $in: roomIds } }).populate({
    path: "roomId",
    populate: { path: "locationId", select: "name" },
  });
}

export default deviceListAllDao;
