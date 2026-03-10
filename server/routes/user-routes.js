import { userController } from "../controller/user-controller.js";
import express from "express";
const router = express.Router();

router.post("/create", userController.create);

//router.get("/list", authMiddleware, userController.list);

router.get("/get/:id", userController.get);

router.put("/update/:id", userController.update);

router.delete("/delete/:id", userController.delete);

export default router;
