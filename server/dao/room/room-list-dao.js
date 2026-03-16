import ROOM_MODEL from "../../models/Room.js";

async function roomListDao(locationId) {
    return await ROOM_MODEL.find({ location_id: locationId });
}
export default roomListDao;
