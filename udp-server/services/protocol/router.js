import {
    packResponse,
    FLAG_ACK,
    FLAG_FIRST,
    FLAG_LAST,
    FLAG_POLL,
    UL_CREATE_SESSION,
    UL_UPLOAD_CONFIG,
    UL_UPLOAD_DECODER,
    UL_UPLOAD_ENCODER,
    UL_UPLOAD_STATS,
    UL_UPLOAD_DATA,
} from "./packet.js";
import { buildSessionResponse } from "./session.js";
import { buildDownlink } from "./downlink.js";
import { decodeMessage } from "../decoder/index.js";
import { sendWebhook } from "../webhook.js";

// Pending downlinks per device — keyed by serialNumber
const pendingDownlinks = new Map();

export async function handlePacket(packet, send) {
    const ackSequence = packet.sequence + 1;

    // Ignoruj ACK pakety od zařízení
    if (packet.flags === FLAG_ACK && packet.data.length === 0) {
        return;
    }

    // POLL request — zařízení žádá o downlink
    if (packet.flags & FLAG_POLL && packet.data.length === 0) {
        const pending = pendingDownlinks.get(packet.serialNumber);
        if (pending) {
            pendingDownlinks.delete(packet.serialNumber);
            console.log(`[Router] Sending pending downlink for device ${packet.serialNumber}`);
            send(packResponse(packet.serialNumber, FLAG_FIRST | FLAG_LAST, ackSequence, pending));
        } else {
            send(buildSessionResponse(packet.serialNumber, ackSequence));
        }
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

            const downlink = buildDownlink(processedData);
            if (downlink) {
                pendingDownlinks.set(packet.serialNumber, downlink);
                console.log(`[Router] Downlink queued for device ${packet.serialNumber}`);
                send(packResponse(packet.serialNumber, FLAG_ACK | FLAG_POLL, ackSequence, null));
            } else {
                send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null));
            }
            break;
        }

        case UL_UPLOAD_CONFIG:
        case UL_UPLOAD_DECODER:
        case UL_UPLOAD_ENCODER:
        case UL_UPLOAD_STATS:
            send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null));
            break;

        default:
            console.error(`[Router] Unknown message type: 0x${msgType.toString(16).padStart(2, "0")}`);
            send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null));
            break;
    }
}