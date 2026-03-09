import axios from 'axios';

export const sendWebhook = async (data) => {
    const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://localhost:4444";

    if (!WEBHOOK_URL) {
        console.warn("[Webhook] URL is not defined in .env");
        return;
    }

    try {
        const response = await axios.post(WEBHOOK_URL, {
            event: "device_message",
            serialNumber: data.serialNumber,
            payload: data,
            sentAt: new Date().toISOString()
        }, {
            timeout: 5000 //5s server timeout
        });

        console.log(`[Webhook] successfully send: ${response.status}`);

    } catch (error) {

        if (error.response) {
            console.error(`[Webhook] Server returned error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
            console.error("[Webhook] Server timeout");
        } else {
            console.error("[Webhook] Configuration error:", error.message);
        }
    }
};