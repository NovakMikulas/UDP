import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "default";

export const sendWebhook = async (data) => {
  const WEBHOOK_URL = process.env.WEBHOOK_URL;
  if (!WEBHOOK_URL) {
    console.warn("[Webhook] WEBHOOK_URL is not defined in .env");
    return;
  }
  try {
    const body = JSON.stringify(data);
    const timestamp = Date.now().toString();
    const signature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(timestamp + body)
      .digest("hex");

    const response = await axios.post(WEBHOOK_URL, body, {
      headers: {
        "Content-Type": "application/json",
        "x-signature": signature,
        "x-timestamp": timestamp,
        "x-source": "udp-server",
      },
      timeout: 5000,
    });

    console.log(`[Webhook] successfully send: ${response.status}`);
  } catch (error) {
    if (error.response) {
      console.error(
        `[Webhook] Server returned error ${error.response.status}:`,
        error.response.data,
      );
    } else if (error.request) {
      console.error("[Webhook] Server timeout");
    } else {
      console.error("[Webhook] Configuration error:", error.message);
    }
  }
};
