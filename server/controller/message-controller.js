import { messageCreateAbl } from "../abl/message/message-create-abl.js";
import { messageDeleteAbl } from "../abl/message/message-delete-abl.js";
import { messageGetAbl } from "../abl/message/message-get-abl.js";
import { messageUpdateAbl } from "../abl/message/message-update-abl.js";

export const messageController = {
  create: async (request, reply) => {
    try {
      const reqParam = request.body;
      await messageCreateAbl();
    } catch (error) {}
  },
  delete: async (request, reply) => {
    try {
      const id = request.body.id;
      await messageDeleteAbl();
    } catch (error) {}
  },
  get: async (request, reply) => {
    try {
      const id = request.params.id;
      await messageGetAbl();
    } catch (error) {}
  },
  update: async (request, reply) => {
    try {
      const updatedMessage = request.body;
      await messageUpdateAbl();
    } catch (error) {}
  },
};
