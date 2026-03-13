import crypto from 'crypto';

export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256')
        .update(salt + password)
        .digest('hex');
    return `${salt}.${hash}`;
}

export function verifyPassword(password, storedValue) {
    const [salt, originalHash] = storedValue.split('.');
    const newHash = crypto.createHash('sha256')
        .update(salt + password)
        .digest('hex');
    return newHash === originalHash;
}