import { locationController } from "../controller/location-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";
import authorizeLocation from "../middleware/auth/authorize-location-middleware.js";
import express from "express";
const router = express.Router();

router.post("/create", authMiddleware, locationController.create);

router.get(
  "/get/:id",
  authMiddleware,
  authorizeLocation(["Owner", "Member"]),
  locationController.get,
);

router.put(
  "/update/:id",
  authMiddleware,
  authorizeLocation(["Owner"]),
  locationController.update,
);

router.delete(
  "/delete/:id",
  authMiddleware,
  authorizeLocation(["Owner"]),
  locationController.delete,
);
router.get("/list", authMiddleware, locationController.list);

export default router;
