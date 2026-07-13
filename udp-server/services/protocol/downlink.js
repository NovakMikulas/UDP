import cbor from "cbor";

const VOLTAGE_LOW = 3.3;
const VOLTAGE_CRITICAL = 3.0;

// Numeric keys/values to mirror the uplink CBOR encoding (no confirmed downlink
// schema exists in the firmware's codec header — CODEC_CLOUD_ENCODER_HASH is empty).
const DOWNLINK_KEY = {
  TYPE: 0,
  LEVEL: 1,
  INTERVAL_REPORT: 2,
  INTERVAL_SAMPLE: 3,
};

const DOWNLINK_TYPE_CONFIG = 0;
const LEVEL = { LOW: 0, CRITICAL: 1 };

const PROFILES = {
  [LEVEL.CRITICAL]: {
    interval_report: 7200,
    interval_sample: 300,
  },
  [LEVEL.LOW]: {
    interval_report: 3600,
    interval_sample: 120,
  },
};

export function buildDownlink(processedData) {
  const voltage = processedData.system?.voltage_rest;
  const serialNumber = processedData.serialNumber;

  if (voltage == null || voltage >= VOLTAGE_LOW) return null;

  const level = voltage < VOLTAGE_CRITICAL ? LEVEL.CRITICAL : LEVEL.LOW;
  const profile = PROFILES[level];

  console.log(
    `[Downlink] Voltage ${voltage}V (level=${level}) — applying profile for device ${serialNumber}`,
  );

  return cbor.encode(new Map([
    [DOWNLINK_KEY.TYPE, DOWNLINK_TYPE_CONFIG],
    [DOWNLINK_KEY.LEVEL, level],
    [DOWNLINK_KEY.INTERVAL_REPORT, profile.interval_report],
    [DOWNLINK_KEY.INTERVAL_SAMPLE, profile.interval_sample],
  ]));
}
