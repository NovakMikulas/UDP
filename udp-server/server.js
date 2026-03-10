import dgram from "dgram";
import dotenv from "dotenv";
import { decodeMessage } from "./services/decoder.js";
import { validateMessage } from "./services/validator.js";
import { sendWebhook } from "./services/webhook.js";
dotenv.config();

//CREATE UDP PROTOCOL SOCKET
const server = dgram.createSocket("udp4");

const PORT = process.env.PORT || 4444;

server.on("listening", () => {
  const address = server.address();
  console.log(`UDP server is running on port: ${address.port}`);
});
server.on("message", (msg, rinfo) => {});

//SERVER ERROR HANDLING
server.on("error", (err) => {
  console.error(`Server error:\n${err.stack}`);
  server.close();
});

server.bind(PORT);

server.on("message", async (msg, rinfo) => {
  // msg = raw binary data (Buffer)
  // rinfo = information about sender (IP, port, etc...)
  if (!(await validateMessage(msg))) {
    return;
  }
  const processedData = await decodeMessage(msg);
  await sendWebhook(processedData);
});
