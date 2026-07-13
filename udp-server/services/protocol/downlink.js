import cbor from "cbor";

const VOLTAGE_LOW = 3.3;
const VOLTAGE_CRITICAL = 3.0;

const DL_DOWNLOAD_CONFIG = 0x82;
const NOCOMPRESSION = 0x00;

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

  const level = voltage < VOLTAGE_CRITICAL ? "critical" : "low";
  const profile = PROFILES[level];

  console.log(
    `[Downlink] Voltage ${voltage}V (${level}) — applying profile for device ${serialNumber}`
  );

  const commands = [
    `app config interval-report ${profile.interval_report}`,
    `app config interval-sample ${profile.interval_sample}`,
    "config save",
  ];

  const parts = [Buffer.from([0x9f])]; // indefinite array start
  for (const cmd of commands) {
    parts.push(cbor.encode(cmd));
  }
  parts.push(Buffer.from([0xff])); // break

  const cborData = Buffer.concat(parts);
  const data = Buffer.concat([
    Buffer.from([DL_DOWNLOAD_CONFIG]),
    Buffer.from([NOCOMPRESSION]),
    cborData,
  ]);

  return data;
}