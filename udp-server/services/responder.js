// services/responder.js
import { packPacket, FLAG_ACK, FLAG_FIRST, FLAG_LAST } from "./validator.js";

export function buildAckResponse(packet) {
  // Server odpovídá ACK se stejným sequence number
  return packPacket(
    packet.serialNumber,
    FLAG_ACK | FLAG_LAST,
    packet.sequence,
    null
  );
}