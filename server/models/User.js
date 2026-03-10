import { Schema, model } from "mongoose";

const USER_SCHEMA = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

const USER_MODEL = model("User", USER_SCHEMA);

export default USER_MODEL;
