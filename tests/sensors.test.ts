import { describe, it, expect } from "vitest";
import {
  createDefaultSensors,
  getCurrentReading,
  isInRange,
  normalizeReading,
  pushReading,
  tickSensors,
  SENSOR_HISTORY,
} from "@/lib/fermentation";
import { SENSOR_SCENARIOS } from "./recipes/sensor-scenarios";

describe("sensor primitives", () => {
  it("creates four default channels matching the UI", () => {
    const sensors = createDefaultSensors();
    expect(sensors).toHaveLength(4);
    expect(sensors.map((s) => s.label)).toEqual([
      "Temperature",
      "Humidity",
      "CO₂",
      "pH",
    ]);
  });

  it("uses base reading before first tick", () => {
    const sensor = createDefaultSensors()[0];
    expect(getCurrentReading(sensor)).toBe(22);
    expect(isInRange(sensor)).toBe(true);
  });

  it("clamps history length to SENSOR_HISTORY", () => {
    let sensor = createDefaultSensors()[0];
    for (let i = 0; i < SENSOR_HISTORY + 10; i++) {
      sensor = pushReading(sensor, 20 + i * 0.01);
    }
    expect(sensor.history).toHaveLength(SENSOR_HISTORY);
  });
});

describe("tickSensors (deterministic)", () => {
  it("applies bounded drift from the previous reading", () => {
    // random=0.9 → drift (0.9 - 0.49) * 0.12 = 0.0492 → 22.05 after 2-decimal rounding
    const [next] = tickSensors(createDefaultSensors().slice(0, 1), () => 0.9);
    expect(next.history).toHaveLength(1);
    expect(getCurrentReading(next)).toBe(22.05);
  });
});

describe("sensor scenarios", () => {
  it.each(SENSOR_SCENARIOS)("$name ($id)", (scenario) => {
    const sensors = scenario.build();
    scenario.checks.forEach((check) => {
      const sensor = sensors.find((s) => s.label === check.label)!;
      expect(getCurrentReading(sensor)).toBe(check.reading);
      expect(isInRange(sensor, check.reading)).toBe(check.inRange);
      if (check.normalized !== undefined) {
        expect(normalizeReading(sensor, check.reading)).toBe(check.normalized);
      }
    });
  });
});
