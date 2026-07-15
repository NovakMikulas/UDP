import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    deviceId: { type: Schema.Types.ObjectId, ref: "Device", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    message: {
      version: { type: Number },
      sequence: { type: Number },
      timestamp: { type: Number },
    },
    system: {
      uptime: { type: Number },
      voltage_load: { type: Number },
      voltage_rest: { type: Number },
      current_load: { type: Number },
    },
    thermometer: {
      temperature: { type: Number },
    },
    accelerometer: {
      accel_x: { type: Number },
      accel_y: { type: Number },
      accel_z: { type: Number },
      orientation: { type: Number },
    },
    motion: {
      totalizer: {
        detect_left: { type: Number, default: 0 },
        detect_right: { type: Number, default: 0 },
        motion_left: { type: Number, default: 0 },
        motion_right: { type: Number, default: 0 },
      },
      samples: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: true },
);

// Safety net against duplicate webhook deliveries (e.g. a UDP retransmit that
// slips past the router's in-memory dedup, such as after a server restart).
// Sparse because message.sequence isn't required by the create schema.
messageSchema.index({ deviceId: 1, "message.sequence": 1 }, { unique: true, sparse: true });

export default model("Message", messageSchema);
