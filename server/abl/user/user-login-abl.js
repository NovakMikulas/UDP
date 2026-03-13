import Ajv from "ajv";
const ajv = new Ajv();
import jwt from "jsonwebtoken";
import userGetDao from "../../dao/user/user-get-dao.js";
import ApiError from "../../utils/api-error.js";
import { verifyPassword } from "../../utils/hash-password.js";
const schema = {
    type: "object",
    properties: {
        username: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
    },
    required: ["password"],
    oneOf: [
        {
            required: ["username"],
            not: { required: ["email"] }
        },
        {
            required: ["email"],
            not: { required: ["username"] }
        }
    ],
};

async function userLoginAbl(data) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    const user = await userGetDao(data)
    console.log(user);
    if (!valid) {
        const message = validate.errors?.map((err) => err.message).join(", ");
        throw new ApiError(400, `[ABL] Validation failed: ${message}`);
    }
    if (!user || verifyPassword(data.password, user.password)) {
        throw new ApiError(400, `[ABL] Invalid credentials`);
    }
    const token = jwt.sign({
        user: { id: user._id, email: user.email, username: user.username, expiresIn: '1h' }
    });
    return { token };
}

export default userLoginAbl;
