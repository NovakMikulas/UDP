import crypto from "crypto";
import ApiError from "../../utils/api-error.js";
import dotenv from "dotenv";
dotenv.config();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "default";

const authorizeWebhook = (req, res, next) => {
  const signature = req.headers["x-signature"];
  const timestamp = req.headers["x-timestamp"];
  if (!signature || !timestamp) {
    return next(
      new ApiError(401, "[MIDDLEWARE] Missing webhook security credentials."),
    );
  }

  // Check timestamp to prevent replay attacks
  const now = Date.now();
  const tolerance = 60000;

  if (Math.abs(now - Number(timestamp)) > tolerance) {
    return next(
      new ApiError(
        403,
        "[MIDDLEWARE] Message expired. Replay attack suspected.",
      ),
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(timestamp + JSON.stringify(req.body))
    .digest("hex");

  // timingSafeEqual throws on mismatched buffer lengths, so check that first -
  // a length mismatch already means the signature is invalid.
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  const isValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

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
