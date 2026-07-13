import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/iotdb";
const client = new MongoClient(MONGO_URI);
let devices;

export async function connectDb() {
  await client.connect();
  devices = client.db().collection("devices");
  console.log("[DB] Connected to MongoDB");
}

export function getDevicesCollection() {
  if (!devices) throw new Error("MongoDB not connected");
  return devices;
}
