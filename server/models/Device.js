import { Schema, model } from "mongoose";
import Message from "./Message.js";

const deviceSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    serialNumber: { type: String, required: true, unique: true },
    // Per-device claim token from the device's QR code, captured on creation
    claimToken: { type: String },
    // motion_left counts entries by default; flip this if the sensor is mounted facing the other way
    invertDirection: { type: Boolean, default: false },
    // Config queued from the frontend, applied and cleared by udp-server on the device's next connection
    pendingConfig: { type: Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true },
);

deviceSchema.pre("deleteOne", { document: false, query: true }, async function () {
  const device = await this.model.findOne(this.getFilter());
  if (device) {
    await Message.deleteMany({ deviceId: device._id });
  }
});

export default model("Device", deviceSchema);
