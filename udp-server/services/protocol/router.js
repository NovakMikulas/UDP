import {
    peekSerialNumber,
    unpackPacketWithToken,
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
import { buildDownlink, buildConfigDownlink } from "./downlink.js";
import { decodeMessage } from "../decoder/index.js";
import { sendWebhook } from "../webhook.js";
import { consumePendingConfig } from "../device-config.js";
import { getDevicesCollection } from "../db.js";

// Pending downlinks per device - keyed by serialNumber
const pendingDownlinks = new Map();

export async function handlePacket(msg, send) {
    const peekedSerialNumber = peekSerialNumber(msg);

    const device = await getDevicesCollection().findOne({ serialNumber: String(peekedSerialNumber) });
    if (!device || !device.claimToken) {
        console.warn(`[Router] Rejected packet: no claim token on record for serial ${peekedSerialNumber}`);
        return;
    }

    const packet = unpackPacketWithToken(msg, device.claimToken);
    const claimToken = device.claimToken;
    const ackSequence = packet.sequence + 1;

    if (packet.flags === FLAG_ACK && packet.data.length === 0) {
        return;
    }

    if (packet.flags & FLAG_POLL && packet.data.length === 0) {
        const pending = pendingDownlinks.get(packet.serialNumber);
        if (pending) {
            pendingDownlinks.delete(packet.serialNumber);
            console.log(`[Router] Sending pending downlink for device ${packet.serialNumber}`);
            send(packResponse(packet.serialNumber, FLAG_FIRST | FLAG_LAST, ackSequence, pending, claimToken));
        } else {
            send(buildSessionResponse(packet.serialNumber, ackSequence, claimToken));
        }
        return;
    }

    if (!packet.data || packet.data.length === 0) {
        send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null, claimToken));
        return;
    }

    const msgType = packet.data[0];

    switch (msgType) {
        case UL_CREATE_SESSION:
            send(packResponse(packet.serialNumber, FLAG_ACK | FLAG_POLL, ackSequence, null, claimToken));
            break;

        case UL_UPLOAD_DATA: {
            const processedData = await decodeMessage(packet.data, packet.serialNumber);
            console.log("[Router] voltage_rest:", processedData.system?.voltage_rest);
            await sendWebhook(processedData);

            // A user-queued config (set via the frontend) takes priority over the
            // automatic voltage-based profile if both happen to be due at once.
            const pendingConfig = await consumePendingConfig(packet.serialNumber);
            const downlink = pendingConfig
                ? buildConfigDownlink(pendingConfig)
                : buildDownlink(processedData);

            if (downlink) {
                pendingDownlinks.set(packet.serialNumber, downlink);
                console.log(`[Router] Downlink queued for device ${packet.serialNumber}`);
                send(packResponse(packet.serialNumber, FLAG_ACK | FLAG_POLL, ackSequence, null, claimToken));
            } else {
                send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null, claimToken));
            }
            break;
        }

        case UL_UPLOAD_CONFIG:
        case UL_UPLOAD_DECODER:
        case UL_UPLOAD_ENCODER:
        case UL_UPLOAD_STATS:
            send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null, claimToken));
            break;

        default:
            console.error(`[Router] Unknown message type: 0x${msgType.toString(16).padStart(2, "0")}`);
            send(packResponse(packet.serialNumber, FLAG_ACK, ackSequence, null, claimToken));
            break;
    }
}
