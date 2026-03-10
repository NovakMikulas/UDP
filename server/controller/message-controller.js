import messageCreateAbl from "../abl/message/message-create-abl.js";
import messageDeleteAbl from "../abl/message/message-delete-abl.js";
import messageGetAbl from "../abl/message/message-get-abl.js";
import messageUpdateAbl from "../abl/message/message-update-abl.js";

export const messageController = {
  create: async (request, reply) => {
    try {
      const newMessage = request.body;
      await messageCreateAbl(newMessage);
    } catch (error) {
      next(error);
    }
  },
  delete: async (request, reply) => {
    try {
      const id = request.body.id;
      await messageDeleteAbl(id);
    } catch (error) {
      next(error);
    }
  },
  get: async (request, reply) => {
    try {
      const id = request.params.id;
      await messageGetAbl(id);
    } catch (error) {
      next(error);
    }
  },
  update: async (request, reply) => {
    try {
      const updatedMessage = request.body;
      await messageUpdateAbl(updatedMessage);
    } catch (error) {
      next(error);
    }
  },
};
