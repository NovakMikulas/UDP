import deviceCreateAbl from "../abl/device/device-create-abl.js";
import deviceDeleteAbl from "../abl/device/device-delete-abl.js";
import deviceGetAbl from "../abl/device/device-get-abl.js";
import deviceUpdateAbl from "../abl/device/device-update-abl.js";
import deviceListAbl from "../abl/device/device-list-abl.js";
export const deviceController = {
  create: async (req, res, next) => {
    try {
      const newDevice = req.body;
      await deviceCreateAbl(newDevice);
      res.status(201).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.body.id;
      await deviceDeleteAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const id = req.params.id;
      await deviceGetAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const updatedDevice = req.body;
      await deviceUpdateAbl(updatedDevice);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const roomId = req.params.roomId;
      const devices = await deviceListAbl(roomId);
      res.status(200).json({ status: "success", data: devices });
    } catch (error) {
      next(error);
    }
  },
};
