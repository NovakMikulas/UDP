import { roomController } from "../controller/room-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";
import authorizeLocation from "../middleware/auth/authorize-location-middleware.js";
import express from "express";
const router = express.Router();

router.post("/create", authMiddleware, roomController.create);

router.get("/list/:locationId", authMiddleware, authorizeLocation(["Owner", "Member"]), roomController.list);

router.get("/get/:roomId", authMiddleware, roomController.get);

router.put("/update/:roomId", authMiddleware, roomController.update);

router.delete("/delete/:roomId", authMiddleware, roomController.delete);

export default router;
