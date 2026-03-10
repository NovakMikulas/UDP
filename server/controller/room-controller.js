import roomCreateAbl from "../abl/room/room-create-abl.js";
import roomDeleteAbl from "../abl/room/room-delete-abl.js";
import roomGetAbl from "../abl/room/room-get-abl.js";
import roomUpdateAbl from "../abl/room/room-update-abl.js";

export const roomController = {
  create: async (request, reply) => {
    try {
      const newRoom = request.body;
      await roomCreateAbl(newRoom);
    } catch (error) {
      next(error);
    }
  },
  delete: async (request, reply) => {
    try {
      const id = request.body.id;
      await roomDeleteAbl(id);
    } catch (error) {
      next(error);
    }
  },
  get: async (request, reply) => {
    try {
      const id = request.params.id;
      await roomGetAbl(id);
    } catch (error) {
      next(error);
    }
  },
  update: async (request, reply) => {
    try {
      const updatedRoom = request.body;
      await roomUpdateAbl(updatedRoom);
    } catch (error) {
      next(error);
    }
  },
};
