import { messageController } from "../controller/message-controller.js";
import express from "express";
const router = express.Router();

router.post("/create", messageController.create);

//router.get("/list", authMiddleware, messageController.list);

router.get("/get/:id", messageController.get);

router.put("/update/:id", messageController.update);

router.delete("/delete/:id", messageController.delete);

export default router;
