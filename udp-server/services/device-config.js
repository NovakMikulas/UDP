import { getDevicesCollection } from "./db.js";

// Atomically reads and clears a device's pendingConfig so it's applied exactly
// once, on the next connection after it was queued from the frontend.
export async function consumePendingConfig(serialNumber) {
  try {
    const devices = getDevicesCollection();
    const device = await devices.findOneAndUpdate(
      { serialNumber: String(serialNumber), pendingConfig: { $exists: true, $ne: null } },
      { $unset: { pendingConfig: "" } },
      { returnDocument: "before" }
    );
    return device?.pendingConfig ?? null;
  } catch (error) {
    console.error(`[DeviceConfig] Failed to consume pending config for ${serialNumber}:`, error.message);
    return null;
  }
}
