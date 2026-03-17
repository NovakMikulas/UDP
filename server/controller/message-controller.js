import messageCreateAbl from "../abl/message/message-create-abl.js";
import messageDeleteAbl from "../abl/message/message-delete-abl.js";
import messageGetAbl from "../abl/message/message-get-abl.js";
//import messageUpdateAbl from "../abl/message/message-update-abl.js";
import messageListAbl from "../abl/message/message-list-abl.js";
export const messageController = {
  create: async (req, res, next) => {
    try {
      const data = req.body;
      await messageCreateAbl(data);
      res.status(201).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.body.id;
      await messageDeleteAbl(id);
      res.status(200).json({ status: "success" });
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const id = req.params.id;
      const message = await messageGetAbl(id);
      res.status(200).json({ status: "success", data: message });
    } catch (error) {
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const deviceId = req.params.deviceId;
      const messages = await messageListAbl(deviceId);
      res.status(200).json({ status: "success", data: messages });
    } catch (error) {
      next(error);
    }
  },
};
