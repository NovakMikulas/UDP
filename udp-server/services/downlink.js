import cbor from "cbor";

const VOLTAGE_LOW = 3.3;
const VOLTAGE_CRITICAL = 3.0;

const PROFILES = {
  critical: {
    interval_report: 7200,
    interval_sample: 300,
  },
  low: {
    interval_report: 3600,
    interval_sample: 120,
  },
};

export function buildDownlink(processedData) {
  const voltage = processedData.system?.voltage_rest;
  const serialNumber = processedData.serialNumber;

  if (voltage == null || voltage >= VOLTAGE_LOW) return null;

  const profile =
    voltage < VOLTAGE_CRITICAL ? PROFILES.critical : PROFILES.low;

  const level = voltage < VOLTAGE_CRITICAL ? "critical" : "low";
  console.log(
    `[Downlink] Voltage ${voltage}V (${level}) — applying "${level}" profile for device ${serialNumber}`,
  );

  return cbor.encode({
    type: "config",
    ...profile,
  });
}
