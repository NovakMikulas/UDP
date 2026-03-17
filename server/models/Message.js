import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    in: { type: Number, default: 0 },
    out: { type: Number, default: 0 },
    battery: { type: Number },
  },
  { timestamps: true },
);

export default model("Message", messageSchema);
