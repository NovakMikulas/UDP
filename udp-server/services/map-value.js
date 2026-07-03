import { unrollTso } from "./unroll-tso.js";

const KEY_MAP = {
  0: "message",
  1: "version",
  2: "sequence",
  3: "timestamp",
  4: "system",
  5: "uptime",
  6: "voltage_load",
  7: "voltage_rest",
  8: "current_load",
  9: "network",
  10: "parameter",
  11: "eest",
  12: "ecl",
  13: "rsrp",
  14: "rsrq",
  15: "snr",
  16: "plmn",
  17: "cid",
  18: "band",
  19: "earfcn",
  20: "thermometer",
  21: "temperature",
  22: "accelerometer",
  23: "accel_x",
  24: "accel_y",
  25: "accel_z",
  26: "orientation",
  27: "motion",
  28: "totalizer",
  29: "detect_left",
  30: "detect_right",
  31: "motion_left",
  32: "motion_right",
  33: "samples",
};

const SCALE = {
  voltage_load: 1000,
  voltage_rest: 1000,
  temperature: 100,
  accel_x: 1000,
  accel_y: 1000,
  accel_z: 1000,
};

const TSO_FIELDS = {
  samples: ["detect_left", "detect_right", "motion_left", "motion_right"],
};

export function mapValue(map) {
  if (!(map instanceof Map)) return map;
  const obj = {};
  for (const [k, v] of map) {
    const name = KEY_MAP[k] ?? String(k);
    if (v instanceof Map) {
      obj[name] = mapValue(v);
    } else if (Array.isArray(v)) {
      const tsoValueKeys = TSO_FIELDS[name];
      obj[name] = tsoValueKeys
        ? unrollTso(v, tsoValueKeys)
        : v.map((item) => (item instanceof Map ? mapValue(item) : item));
    } else {
      obj[name] = SCALE[name] != null ? v / SCALE[name] : v;
    }
  }
  return obj;
}
