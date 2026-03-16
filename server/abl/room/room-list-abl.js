import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import roomListDao from "../../dao/room/room-list-dao.js";

const schema = {
    type: "object",
    properties: {
        location_id: { type: "string" },
    },
    required: ["location_id"],
    additionalProperties: false,
};

async function roomListAbl(locationId) {
    const locationObject = { location_id: locationId };
    const validate = ajv.compile(schema);
    const valid = validate(locationObject);
    if (!valid) {
        const message = validate.errors?.map((err) => err.message).join(", ");
        throw new ApiError(400, `[ABL] Validation failed: ${message}`);
    }
    const rooms = await roomListDao(locationId);
    if (!rooms) {
        throw new ApiError(400, `[ABL] No rooms found for the specified location`);
    }
    return rooms;
}
export default roomListAbl;
