import {
    packResponse,
    FLAG_ACK,
    FLAG_POLL,
    UL_CREATE_SESSION,
    UL_UPLOAD_CONFIG,
    UL_UPLOAD_DECODER,
    UL_UPLOAD_ENCODER,
    UL_UPLOAD_STATS,
    UL_UPLOAD_DATA,
} from "./packet.js";
import { buildSessionResponse } from "./session.js";
import { decodeMessage } from "../decoder/index.js";
import { sendWebhook } from "../webhook.js";

const UPLOAD_TYPES = [UL_UPLOAD_CONFIG, UL_UPLOAD_DECODER, UL_UPLOAD_ENCODER, UL_UPLOAD_STATS];

export async function handlePacket(packet, send) {
    const ackSequence = packet.sequence + 1;

    // Ignore ACK packets from device
    if (packet.flags === FLAG_ACK && packet.data.length === 0) {
        return;
    }

    // POLL request — device requests downlink
    if (packet.flags & FLAG_POLL && packet.data.length === 0) {
        send(buildSessionResponse(packet.serialNumber, ackSequence));
        return;
    }

    if (!packet.data || packet.data.length === 0) {
        send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null));
        return;
    }

    const msgType = packet.data[0];

    switch (msgType) {
        case UL_CREATE_SESSION:
            send(packResponse(packet.serialNumber, FLAG_ACK | FLAG_POLL, ackSequence, null));
            break;

        case UL_UPLOAD_DATA: {
            const processedData = await decodeMessage(packet.data, packet.serialNumber);
            await sendWebhook(processedData);
            send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null));
            break;
        }

        default:
            if (!UPLOAD_TYPES.includes(msgType)) {
                console.error(`[Router] Unknown message type: 0x${msgType.toString(16).padStart(2, "0")}`);
            }
            send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null));
            break;
    }
}