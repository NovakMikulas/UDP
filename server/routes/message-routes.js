import { messageController } from "../controller/message-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";
import authorizeMiddleware from "../middleware/auth/authorize-middleware.js";
import express from "express";
const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  messageController.create,
);

router.get(
  "/list/:deviceId",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  messageController.list,
);

router.get(
  "/get/:id",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  messageController.get,
);

router.put(
  "/update/:id",
  authMiddleware,
  authorizeMiddleware(["Owner"]),
  messageController.update,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeMiddleware(["Owner"]),
  messageController.delete,
);

export default router;
