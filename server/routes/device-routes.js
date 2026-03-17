import { deviceController } from "../controller/device-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";
import authorizeMiddleware from "../middleware/auth/authorize-middleware.js";
import express from "express";
const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  deviceController.create,
);

router.get(
  "/list/:roomId",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  deviceController.list,
);

router.get(
  "/get/:id",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  deviceController.get,
);

router.put(
  "/update/:id",
  authMiddleware,
  authorizeMiddleware(["Owner"]),
  deviceController.update,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeMiddleware(["Owner"]),
  deviceController.delete,
);

export default router;
