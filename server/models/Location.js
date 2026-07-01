import { Schema, model } from "mongoose";
import Room from "./Room.js";

const locationSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    invitations: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    name: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true },
);

locationSchema.pre("deleteOne", { document: false, query: true }, async function () {
  const location = await this.model.findOne(this.getFilter());
  if (location) {
    const rooms = await Room.find({ locationId: location._id }, "_id");
    for (const room of rooms) {
      await Room.deleteOne({ _id: room._id });
    }
  }
});

export default model("Location", locationSchema);
