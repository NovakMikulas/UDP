import { getIO } from "./index.js";
import { userSockets } from "./connection.js";
import locationGetDao from "../dao/location/location-get-dao.js";

export function emitToUser(userId, event, data) {
  const socketIds = userSockets.get(String(userId));
  if (!socketIds) return;
  for (const socketId of socketIds) {
    getIO().to(socketId).emit(event, data);
  }
}

export async function emitToLocation(locationId, event, data) {
  const location = await locationGetDao(locationId);
  if (!location) return;

  const memberIds = [String(location.owner), ...location.members.map(String)];
  for (const userId of memberIds) {
    emitToUser(userId, event, data);
  }
}
