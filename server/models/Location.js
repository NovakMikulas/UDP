import { Schema, model } from "mongoose";

const locationSchema = new Schema(
  {
    owner_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorized_users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true },
);

export default model("Location", locationSchema);
