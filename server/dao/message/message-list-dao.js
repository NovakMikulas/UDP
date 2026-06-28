import MESSAGE_MODEL from "../../models/Message.js";

async function messageListDao(deviceId, page, limit) {
  const filter = { deviceId };
  const [items, total] = await Promise.all([
    MESSAGE_MODEL.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    MESSAGE_MODEL.countDocuments(filter),
  ]);
  return { items, total };
}
export default messageListDao;
