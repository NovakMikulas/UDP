import { Schema, model } from "mongoose";

const deviceSchema = new Schema(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    serialNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default model("Device", deviceSchema);
