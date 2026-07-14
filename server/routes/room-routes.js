import { roomController } from "../controller/room-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";
import authorizeMiddleware from "../middleware/auth/authorize-middleware.js";
import { resolveRoomLocationId } from "../utils/resource-location-resolvers.js";
import express from "express";
const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  roomController.create,
);

router.get(
  "/list/:locationId",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  roomController.list,
);

router.get(
  "/get/:roomId",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"], resolveRoomLocationId),
  roomController.get,
);

router.put(
  "/update/:roomId",
  authMiddleware,
  authorizeMiddleware(["Owner"], resolveRoomLocationId),
  roomController.update,
);

router.delete(
  "/delete/:roomId",
  authMiddleware,
  authorizeMiddleware(["Owner"], resolveRoomLocationId),
  roomController.delete,
);

export default router;
