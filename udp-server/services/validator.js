import crypto from "crypto";
const LEN_SIZE = 2;
const HASH_SIZE = 6;
const LEN_HASH_SIZE = (LEN_SIZE + HASH_SIZE);

export const validateMessage = async (msg) => {

    try {
        if (msg.readUInt16LE(0) !== msg.length) {
            throw new Error('Length field does not match');
        }

        const hash = msg.slice(LEN_SIZE, LEN_HASH_SIZE);

        const sha256 = crypto.createHash('sha256');
        sha256.update(msg.slice(LEN_HASH_SIZE));
        const hashCalc = sha256.digest().slice(0, HASH_SIZE);

        if (Buffer.compare(hash, hashCalc) !== 0) {
            throw new Error('Hash does not match');
        }
        return true;
    } catch (error) {
        console.error(
            `Message invalid for device: ${serial_number}:`,
            error.message,
        );
        return false;
    }
};
