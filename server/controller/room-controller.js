import roomCreateAbl from "../abl/room/room-create-abl.js";
import roomDeleteAbl from "../abl/room/room-delete-abl.js";
import roomGetAbl from "../abl/room/room-get-abl.js";
import roomUpdateAbl from "../abl/room/room-update-abl.js";
import roomListAbl from "../abl/room/room-list-abl.js";
export const roomController = {
  create: async (req, res, next) => {
    try {
      const newRoom = req.body;
      await roomCreateAbl(newRoom);
      res.status(201).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.params.roomId;
      await roomDeleteAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const id = req.params.roomId;
      await roomGetAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const updatedRoom = req.body;
      await roomUpdateAbl(updatedRoom);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const locationId = req.params.locationId;
      const rooms = await roomListAbl(locationId);
      res.status(200).json({ status: "success", data: rooms });
    } catch (error) {
      next(error);
    }
  },
};
