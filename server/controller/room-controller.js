import { roomCreateAbl } from "../abl/room/room-create-abl.js";
import { roomDeleteAbl } from "../abl/room/room-delete-abl.js";
import { roomGetAbl } from "../abl/room/room-get-abl.js";
import { roomUpdateAbl } from "../abl/room/room-update-abl.js";

export const roomController = {
  create: async (request, reply) => {
    try {
      const reqParam = request.body;
      await roomCreateAbl();
    } catch (error) {}
  },
  delete: async (request, reply) => {
    try {
      const id = request.body.id;
      await roomDeleteAbl();
    } catch (error) {}
  },
  get: async (request, reply) => {
    try {
      const id = request.params.id;
      await roomGetAbl();
    } catch (error) {}
  },
  update: async (request, reply) => {
    try {
      const updatedRoom = request.body;
      await roomUpdateAbl();
    } catch (error) {}
  },
};
