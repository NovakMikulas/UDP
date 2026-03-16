import Ajv from "ajv";
const ajv = new Ajv();
import ApiError from "../../utils/api-error.js";
import messageListDao from "../../dao/message/message-list-dao.js";

const schema = {
    type: "object",
    properties: {
        device_id: { type: "string" },
    },
    required: ["device_id"],
    additionalProperties: false,
};

async function messageListAbl(deviceId) {
    const deviceObject = { device_id: deviceId };
    const validate = ajv.compile(schema);
    const valid = validate(deviceObject);
    if (!valid) {
        const message = validate.errors?.map((err) => err.message).join(", ");
        throw new ApiError(400, `[ABL] Validation failed: ${message}`);
    }
    const messages = await messageListDao(userId);
    if (!messages) {
        throw new ApiError(400, `[ABL] No messages found for the specified device`);
    }
    return messages;
}
export default messageListAbl;
