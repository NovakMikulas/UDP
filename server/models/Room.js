import { Schema, model } from "mongoose";

const roomSchema = new Schema(
  {
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
  },
  { timestamps: true },
);

export default model("Room", roomSchema);
