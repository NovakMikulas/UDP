import { deviceController } from "../controller/device-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";
import authorizeMiddleware from "../middleware/auth/authorize-middleware.js";
import { resolveDeviceLocationId, resolveRoomLocationId } from "../utils/resource-location-resolvers.js";
import express from "express";
const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  deviceController.create,
);

router.get("/listAll", authMiddleware, deviceController.listAll);

router.get(
  "/list/:roomId",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"], resolveRoomLocationId),
  deviceController.list,
);

router.get(
  "/get/:deviceId",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"], resolveDeviceLocationId),
  deviceController.get,
);

router.put(
  "/update/:deviceId",
  authMiddleware,
  authorizeMiddleware(["Owner"], resolveDeviceLocationId),
  deviceController.update,
);

router.delete(
  "/delete/:deviceId",
  authMiddleware,
  authorizeMiddleware(["Owner"], resolveDeviceLocationId),
  deviceController.delete,
);

router.get(
  "/:deviceId/config",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"], resolveDeviceLocationId),
  deviceController.getConfig,
);

router.put(
  "/:deviceId/config",
  authMiddleware,
  authorizeMiddleware(["Owner"], resolveDeviceLocationId),
  deviceController.setConfig,
);

export default router;
