// test-sender.js
import dgram from "dgram";
import cbor from "cbor";
import crypto from "crypto";

const client = dgram.createSocket("udp4");

// 1. Připravíme data (to, co posílá CHESTER)
const payload = cbor.encode({ in: 10, out: 4 });
const serialNumber = Buffer.alloc(4);
serialNumber.writeUInt32LE(12345678); // Náhodné S/N

// 2. Sestavíme část pro výpočet hashe (SN + Payload)
const partToHash = Buffer.concat([serialNumber, payload]);

// 3. Vypočítáme hash (prvních 6 bajtů ze SHA-256)
const hash = crypto.createHash('sha256').update(partToHash).digest().slice(0, 6);

// 4. Celková délka (2B délka + 6B hash + 4B SN + Payload)
const totalLength = 2 + 6 + 4 + payload.length;
const lengthBuf = Buffer.alloc(2);
lengthBuf.writeUInt16LE(totalLength);

// 5. Spojíme vše do jednoho finálního paketu
const finalPacket = Buffer.concat([lengthBuf, hash, serialNumber, payload]);

// 6. Odešleme na tvůj server
client.send(finalPacket, 4444, "localhost", (err) => {
    if (err) console.error(err);
    else console.log("📤 Testovací paket odeslán!");
    client.close();
});