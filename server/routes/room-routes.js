import { roomController } from "../controller/room-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";

import express from "express";
const router = express.Router();

router.post("/create", authMiddleware, roomController.create);

//router.get("/list", authMiddleware, roomController.list);

router.get("/get/:id", authMiddleware, roomController.get);

router.put("/update/:id", authMiddleware, roomController.update);

router.delete("/delete/:id", authMiddleware, roomController.delete);

export default router;
