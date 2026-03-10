import { roomController } from "../controller/room-controller.js";
import express from "express";
const router = express.Router();

router.post("/create", roomController.create);

//router.get("/list", authMiddleware, roomController.list);

router.get("/get/:id", roomController.get);

router.put("/update/:id", roomController.update);

router.delete("/delete/:id", roomController.delete);

export default router;
