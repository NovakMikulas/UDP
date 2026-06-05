import USER_MODEL from "../../models/User.js";

async function userUpdateDao(userId, data) {
  return await USER_MODEL.findByIdAndUpdate(userId, data, { new: true }).select("-password");
}

export default userUpdateDao;
