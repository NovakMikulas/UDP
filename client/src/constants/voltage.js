export const VOLTAGE_LOW = 3.3;
export const VOLTAGE_CRITICAL = 3.0;
export const VOLTAGE_CUTOFF = 2.0;

export function voltageStatus(voltage) {
  if (voltage == null) return "—";
  if (voltage < VOLTAGE_CUTOFF) return "Dead";
  if (voltage < VOLTAGE_CRITICAL) return "Critical";
  if (voltage < VOLTAGE_LOW) return "Low";
  return "OK";
}

export function isVoltageAlive(voltage) {
  return voltage != null && voltage >= VOLTAGE_CUTOFF;
}
