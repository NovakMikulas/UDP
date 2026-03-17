import USER_MODEL from "../../models/User.js";
async function userCreateDao(data) {
    return await USER_MODEL.create(data);
}
export default userCreateDao;
