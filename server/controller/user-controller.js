import userLoginAbl from "../abl/user/user-login-abl.js";
import userRegisterAbl from "../abl/user/user-register-abl.js";
import userUpdateAbl from "../abl/user/user-update-abl.js";
import userChangePasswordAbl from "../abl/user/user-changePassword-abl.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const userController = {
  login: async (req, res, next) => {
    try {
      const credentials = req.body;
      const result = await userLoginAbl(credentials);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  },
  register: async (req, res, next) => {
    try {
      const newUser = req.body;
      await userRegisterAbl(newUser);
      res
        .status(200)
        .json({ status: "success", message: "user registered successfully" });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  },
  update: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const updated = await userUpdateAbl(userId, req.body);

      const token = jwt.sign(
        { id: updated._id, email: updated.email, username: updated.username },
        process.env.JWT_SECRET || "123",
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      const user = { id: updated._id, email: updated.email, username: updated.username };
      res.status(200).json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      const userId = req.user.id;
      await userChangePasswordAbl(userId, req.body);
      res.status(200).json({ status: "success", message: "Password changed successfully." });
    } catch (error) {
      next(error);
    }
  },
};
