import { userController } from "../controller/user-controller.js";
import express from "express";
const router = express.Router();

router.post("/login", userController.login);

//router.get("/list", authMiddleware, userController.list);

router.post("/register", userController.register);

export default router;
