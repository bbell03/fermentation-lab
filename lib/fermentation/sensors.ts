import { DEFAULT_SENSORS, SENSOR_HISTORY } from "./constants";
import type { Sensor } from "./types";

export function initSensor(
  base: number,
  noise: number,
  unit: string,
  label: string,
  lo: number,
  hi: number,
  color: string,
): Sensor {
  return { base, noise, unit, label, lo, hi, color, history: [] };
}

export function createDefaultSensors(): Sensor[] {
  return DEFAULT_SENSORS.map((s) =>
    initSensor(s.base, s.noise, s.unit, s.label, s.lo, s.hi, s.color),
  );
}

export function tickSensors(sensors: Sensor[], random: () => number = Math.random): Sensor[] {
  return sensors.map((s) => {
    const drift = (random() - 0.49) * s.noise;
    const prev = s.history.length ? s.history[s.history.length - 1].v : s.base;
    const newVal = Math.max(s.lo - 2, Math.min(s.hi + 2, prev + drift));
    const history = [...s.history.slice(-(SENSOR_HISTORY - 1)), { v: +newVal.toFixed(2) }];
    return { ...s, history };
  });
}

export function getCurrentReading(sensor: Sensor): number {
  return sensor.history.length ? sensor.history[sensor.history.length - 1].v : sensor.base;
}

export function isInRange(sensor: Sensor, value = getCurrentReading(sensor)): boolean {
  return value >= sensor.lo && value <= sensor.hi;
}

export function normalizeReading(sensor: Sensor, value: number): number {
  const norm = (value - sensor.lo) / (sensor.hi - sensor.lo);
  return +Math.max(0, Math.min(1, norm)).toFixed(3);
}

export function pushReading(sensor: Sensor, value: number): Sensor {
  const history = [...sensor.history.slice(-(SENSOR_HISTORY - 1)), { v: +value.toFixed(2) }];
  return { ...sensor, history };
}
