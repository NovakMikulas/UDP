import deviceGetDao from "../dao/device/device-get-dao.js";
import roomGetDao from "../dao/room/room-get-dao.js";
import messageGetDao from "../dao/message/message-get-dao.js";

// Each resolver derives the resource's real location from the database via
// the URL param identifying it - never from anything the client supplies -
// for use as authorizeMiddleware's resolveResourceLocationId argument.

export async function resolveDeviceLocationId(req) {
  const device = await deviceGetDao(req.params.deviceId);
  if (!device) return null;
  const room = await roomGetDao(device.roomId);
  return room?.locationId ?? null;
}

export async function resolveRoomLocationId(req) {
  const room = await roomGetDao(req.params.roomId);
  return room?.locationId ?? null;
}

export async function resolveMessageLocationId(req) {
  const message = await messageGetDao(req.params.messageId);
  if (!message) return null;
  const room = await roomGetDao(message.roomId);
  return room?.locationId ?? null;
}
