import USER_MODEL from "../../models/User.js";
async function userGetDao(data) {
    return await USER_MODEL.findOne({
        $or: [
            { email: data.email },
            { username: data.username }
        ]
    });
}
export default userGetDao;
