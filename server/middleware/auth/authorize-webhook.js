import crypto from "crypto";
import ApiError from "../../utils/api-error.js";
import dotenv from "dotenv";
dotenv.config();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "default";

const authorizeWebhook = (req, res, next) => {
  const signature = req.headers["x-signature"];
  const timestamp = req.body.timestamp;
  if (!signature || !timestamp) {
    return next(
      new ApiError(401, "[MIDDLEWARE] Missing webhook security credentials."),
    );
  }

  // Check timestamp to prevent replay attacks
  const msgTime = new Date(timestamp).getTime();
  const now = Date.now();
  const tolerance = 60000; // 1 minute tolerance for replay attacks

  if (Math.abs(now - msgTime) > tolerance) {
    return next(
      new ApiError(
        403,
        "[MIDDLEWARE] Message expired. Replay attack suspected.",
      ),
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  // timingSafeEqual to prevent against timing attacks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!isValid) {
    return next(
      new ApiError(
        403,
        "[MIDDLEWARE] Invalid signature. Integrity check failed.",
      ),
    );
  }

  next();
};
export default authorizeWebhook;
