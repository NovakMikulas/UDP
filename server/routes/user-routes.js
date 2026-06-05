import { userController } from "../controller/user-controller.js";
import authMiddleware from "../middleware/auth/authenticate-middleware.js";

import express from "express";
const router = express.Router();

router.post("/login", userController.login);

router.post("/register", userController.register);

router.post("/logout", authMiddleware, userController.logout);
router.put("/update", authMiddleware, userController.update);
router.put("/change-password", authMiddleware, userController.changePassword);
export default router;
