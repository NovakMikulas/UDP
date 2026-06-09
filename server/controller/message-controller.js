import messageCreateAbl from "../abl/message/message-create-abl.js";
import messageGetAbl from "../abl/message/message-get-abl.js";
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
  get: async (req, res, next) => {
    try {
      const id = req.params.messageId;
      const message = await messageGetAbl(id);
      res.status(200).json({ status: "success", data: message });
    } catch (error) {
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const data = { deviceId: req.params.deviceId };
      if (req.query.page !== undefined) data.page = Number(req.query.page);
      if (req.query.limit !== undefined) data.limit = Number(req.query.limit);
      const { items, page, limit, total, totalPages } = await messageListAbl(data);
      res.status(200).json({
        status: "success",
        data: items,
        pagination: { page, limit, total, totalPages },
      });
    } catch (error) {
      next(error);
    }
  },
};
