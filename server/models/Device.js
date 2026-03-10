import { Schema, model } from "mongoose";

const deviceSchema = new Schema(
  {
    room_id: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    serial_number: { type: String, required: true, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true },
);

export default model("Device", deviceSchema);
