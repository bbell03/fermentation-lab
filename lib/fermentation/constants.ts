import type { YeastType } from "./types";

export const YEAST_TYPES: YeastType[] = [
  { id: "instant", label: "Instant Dry", multiplier: 1.0, lag: 0.5 },
  { id: "active", label: "Active Dry", multiplier: 0.85, lag: 1.2 },
  { id: "fresh", label: "Fresh Cake", multiplier: 1.15, lag: 0.3 },
  { id: "wild", label: "Wild / Sourdough", multiplier: 0.55, lag: 2.5 },
];

export const SENSOR_HISTORY = 60;

export const DEFAULT_SENSORS = [
  { base: 22, noise: 0.12, unit: "°C", label: "Temperature", lo: 16, hi: 28, color: "#C8F55A" },
  { base: 72, noise: 0.4, unit: "%", label: "Humidity", lo: 55, hi: 90, color: "#5AC8F5" },
  { base: 415, noise: 0.9, unit: "ppm", label: "CO₂", lo: 380, hi: 600, color: "#F5A55A" },
  { base: 7.2, noise: 0.03, unit: "pH", label: "pH", lo: 6.5, hi: 8.0, color: "#C55AF5" },
] as const;
