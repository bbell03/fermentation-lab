import type { Sensor } from "@/lib/fermentation";
import { initSensor, pushReading } from "@/lib/fermentation";

export type SensorScenario = {
  id: string;
  name: string;
  description: string;
  build: () => Sensor[];
  checks: {
    label: string;
    reading: number;
    inRange: boolean;
    normalized?: number;
  }[];
};

export const SENSOR_SCENARIOS: SensorScenario[] = [
  {
    id: "nominal-baseline",
    name: "Nominal Baseline",
    description: "Fresh sensors at default base readings — all channels in range.",
    build: () => [
      initSensor(22, 0.12, "°C", "Temperature", 16, 28, "#C8F55A"),
      initSensor(72, 0.4, "%", "Humidity", 55, 90, "#5AC8F5"),
    ],
    checks: [
      { label: "Temperature", reading: 22, inRange: true, normalized: 0.5 },
      { label: "Humidity", reading: 72, inRange: true, normalized: 0.486 },
    ],
  },
  {
    id: "temperature-high",
    name: "Temperature High Alert",
    description: "Chamber overheats past the upper threshold.",
    build: () => [pushReading(initSensor(22, 0.12, "°C", "Temperature", 16, 28, "#C8F55A"), 29.5)],
    checks: [{ label: "Temperature", reading: 29.5, inRange: false }],
  },
  {
    id: "co2-spike",
    name: "CO₂ Spike",
    description: "Active ferment pushes CO₂ above the nominal band.",
    build: () => [pushReading(initSensor(415, 0.9, "ppm", "CO₂", 380, 600, "#F5A55A"), 615)],
    checks: [{ label: "CO₂", reading: 615, inRange: false }],
  },
  {
    id: "ph-low",
    name: "pH Low",
    description: "Acidification drops pH below the safe band.",
    build: () => [pushReading(initSensor(7.2, 0.03, "pH", "pH", 6.5, 8.0, "#C55AF5"), 6.3)],
    checks: [{ label: "pH", reading: 6.3, inRange: false }],
  },
];
