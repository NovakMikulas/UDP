import { deviceController } from "../controller/device-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";

import express from "express";
const router = express.Router();

router.post("/create", authMiddleware, deviceController.create);

router.get("/list/:roomId", authMiddleware, deviceController.list);

router.get("/get/:id", authMiddleware, deviceController.get);

router.put("/update/:id", authMiddleware, deviceController.update);

router.delete("/delete/:id", authMiddleware, deviceController.delete);

export default router;
