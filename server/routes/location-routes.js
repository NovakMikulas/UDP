import { locationController } from "../controller/location-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";
import authorizeMiddleware from "../middleware/auth/authorize-middleware.js";
import express from "express";
const router = express.Router();

router.post("/create", authMiddleware, locationController.create);

router.get(
  "/get/:locationId",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  locationController.get,
);

router.put(
  "/update/:locationId",
  authMiddleware,
  authorizeMiddleware(["Owner"]),
  locationController.update,
);

router.delete(
  "/delete/:locationId",
  authMiddleware,
  authorizeMiddleware(["Owner"]),
  locationController.delete,
);

router.get("/list", authMiddleware, locationController.list);

router.post(
  "/invite/:locationId",
  authMiddleware,
  authorizeMiddleware(["Owner", "Member"]),
  locationController.invite,
);

router.delete(
  "/kick/:locationId/:userId",
  authMiddleware,
  authorizeMiddleware(["Owner"]),
  locationController.kick,
);

router.get("/invitations", authMiddleware, locationController.listInvitations);
router.post("/invitations/:locationId/accept", authMiddleware, locationController.acceptInvite);
router.post("/invitations/:locationId/decline", authMiddleware, locationController.declineInvite);

export default router;
