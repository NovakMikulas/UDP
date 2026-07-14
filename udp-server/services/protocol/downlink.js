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

// Config field -> firmware shell command name (interval_report -> interval-report)
const CONFIG_FIELDS = [
  "interval_report",
  "interval_sample",
  "interval_poll",
  "sensitivity",
  "motion_sens",
  "motion_blind",
  "motion_pulse",
  "motion_window",
];

function encodeCommands(commands) {
  const parts = [Buffer.from([0x9f])]; // indefinite array start
  for (const cmd of commands) {
    parts.push(cbor.encode(cmd));
  }
  parts.push(Buffer.from([0xff])); // break

  const cborData = Buffer.concat(parts);
  return Buffer.concat([
    Buffer.from([DL_DOWNLOAD_CONFIG]),
    Buffer.from([NOCOMPRESSION]),
    cborData,
  ]);
}

export function buildDownlink(processedData) {
  const voltage = processedData.system?.voltage_rest;
  const serialNumber = processedData.serialNumber;

  if (voltage == null || voltage === 0 || voltage >= VOLTAGE_LOW) return null;

  const level = voltage < VOLTAGE_CRITICAL ? "critical" : "low";
  const profile = PROFILES[level];

  console.log(
    `[Downlink] Voltage ${voltage}V (${level}) - applying profile for device ${serialNumber}`
  );

  const commands = [
    `app config interval-report ${profile.interval_report}`,
    `app config interval-sample ${profile.interval_sample}`,
    "config save",
  ];

  return encodeCommands(commands);
}

// Builds a downlink from a device's user-queued pendingConfig (Device.pendingConfig
// in MongoDB), only including whichever fields were actually set.
export function buildConfigDownlink(pendingConfig) {
  const commands = [];
  for (const field of CONFIG_FIELDS) {
    const value = pendingConfig[field];
    if (value == null) continue;
    commands.push(`app config ${field.replace(/_/g, "-")} ${value}`);
  }
  if (commands.length === 0) return null;
  commands.push("config save");

  return encodeCommands(commands);
}