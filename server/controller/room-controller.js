import roomCreateAbl from "../abl/room/room-create-abl.js";
import roomDeleteAbl from "../abl/room/room-delete-abl.js";
import roomGetAbl from "../abl/room/room-get-abl.js";
import roomUpdateAbl from "../abl/room/room-update-abl.js";
import roomListAbl from "../abl/room/room-list-abl.js";
export const roomController = {
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const room = await roomCreateAbl(data);
      res.status(201).json({ status: "success", data: room });
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
      const room = await roomGetAbl(id);
      res.status(200).json({ status: "success", data: room });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const room = req.body;
      const data = {
        ...room,
        id: req.params.roomId,
      };
      const updatedRoom = await roomUpdateAbl(data);
      res.status(200).json({ status: "success", data: updatedRoom });
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
