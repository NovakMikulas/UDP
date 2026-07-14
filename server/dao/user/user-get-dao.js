import USER_MODEL from "../../models/User.js";
async function userGetDao(data) {
    const conditions = [];
    if (data.email) conditions.push({ email: data.email });
    if (data.username) conditions.push({ username: data.username });
    if (conditions.length === 0) return null;

    return await USER_MODEL.findOne({ $or: conditions });
}
export default userGetDao;
