export const EMPTY_DEVICE_CONFIG = {
  interval_report: "",
  interval_sample: "",
  interval_poll: "",
  sensitivity: "",
  motion_sens: "",
  motion_blind: "",
  motion_pulse: "",
  motion_window: "",
};

export const SENSITIVITY_OPTIONS = ["low", "medium", "high", "individual"];

// advanced: true fields only apply (and are only shown) when sensitivity = "individual"
export const CONFIG_FIELDS = [
  {
    key: "interval_report",
    label: "Report interval (s)",
    min: 30,
    max: 86400,
    hint: "How often the device sends a full data report. Default: 1800s (30 min).",
  },
  {
    key: "interval_sample",
    label: "Sample interval (s)",
    min: 1,
    max: 86400,
    hint: "How often the device samples sensor data between reports. Default: 60s.",
  },
  {
    key: "interval_poll",
    label: "Poll interval (s)",
    min: 0,
    max: 86400,
    hint: "How often the device polls the server for downlink messages. 0 = disabled. Default: 0.",
  },
  {
    key: "sensitivity",
    label: "Sensitivity",
    select: SENSITIVITY_OPTIONS,
    hint: "Motion detection sensitivity. Options: low, medium, high, individual.",
  },
  {
    key: "motion_sens",
    label: "Motion sensitivity (1–255)",
    min: 1,
    max: 255,
    hint: "Raw PIR sensor sensitivity threshold. Only shown when sensitivity = individual.",
    advanced: true,
  },
  {
    key: "motion_blind",
    label: "Motion blind time (0–10s)",
    min: 0,
    max: 10,
    hint: "Time after detection during which further motion is ignored. Only shown when sensitivity = individual.",
    advanced: true,
  },
  {
    key: "motion_pulse",
    label: "Motion pulse count (1–10)",
    min: 1,
    max: 10,
    hint: "Number of PIR pulses required to register a detection. Only shown when sensitivity = individual.",
    advanced: true,
  },
  {
    key: "motion_window",
    label: "Motion window (0–10s)",
    min: 0,
    max: 10,
    hint: "Time window within which motion pulses are counted. Only shown when sensitivity = individual.",
    advanced: true,
  },
];
