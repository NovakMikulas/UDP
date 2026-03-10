import userCreateAbl from "../abl/user/user-create-abl.js";
import userDeleteAbl from "../abl/user/user-delete-abl.js";
import userGetAbl from "../abl/user/user-get-abl.js";
import userUpdateAbl from "../abl/user/user-update-abl.js";

export const userController = {
  create: async (req, res) => {
    try {
      const newUser = req.body;
      await userCreateAbl(newUser);
      res.status(201).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res) => {
    try {
      const id = req.body.id;
      await userDeleteAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res) => {
    try {
      const id = req.params.id;
      await userGetAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res) => {
    try {
      const updatedUser = req.body;
      await userUpdateAbl(updatedUser);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
};
