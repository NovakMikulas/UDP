import { Schema, model } from "mongoose";

const locationSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true },
);

export default model("Location", locationSchema);
