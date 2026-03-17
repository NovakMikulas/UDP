import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "default";

export const sendWebhook = async (data) => {
  const WEBHOOK_URL =
    process.env.WEBHOOK_URL || "http://localhost:3000/api/message/create";

  if (!WEBHOOK_URL) {
    console.warn("[Webhook] URL is not defined in .env");
    return;
  }
  console.log("[Webhook] Sending data to webhook:", data);
  try {
    const body = JSON.stringify(data);
    const signature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    const response = await axios.post(
      WEBHOOK_URL,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "x-signature": signature,
          "x-source": "udp-server",
        },
      },
      { timeout: 5000 },
    );

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
