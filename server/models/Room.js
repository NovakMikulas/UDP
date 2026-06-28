import { Schema, model } from "mongoose";
import Device from "./Device.js";

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

roomSchema.pre("deleteOne", { document: false, query: true }, async function () {
  const room = await this.model.findOne(this.getFilter());
  if (room) {
    const devices = await Device.find({ roomId: room._id }, "_id");
    for (const device of devices) {
      await Device.deleteOne({ _id: device._id });
    }
  }
});

export default model("Room", roomSchema);
