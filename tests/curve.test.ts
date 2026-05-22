import { describe, it, expect } from "vitest";
import {
  generateCurve,
  summarizeCurve,
  getActivityAtHour,
  isValidCurveParams,
  YEAST_TYPES,
} from "@/lib/fermentation";

describe("generateCurve", () => {
  it("returns monotonically increasing hour steps of 0.25", () => {
    const { points } = generateCurve(12.5, "instant", 22, 6);
    for (let i = 1; i < points.length; i++) {
      expect(points[i].hour - points[i - 1].hour).toBe(0.25);
    }
    expect(points[0].hour).toBe(0);
    expect(points[points.length - 1].hour).toBe(6);
  });

  it("never emits negative activity", () => {
    const { points } = generateCurve(16, "wild", 4, 72);
    points.forEach((p) => expect(p.activity).toBeGreaterThanOrEqual(0));
  });

  it("falls back to instant yeast for unknown types", () => {
    const unknown = generateCurve(12.5, "nonexistent", 22, 24);
    const instant = generateCurve(12.5, "instant", 22, 24);
    expect(unknown.peakTime).toBe(instant.peakTime);
    expect(unknown.peakHeight).toBe(instant.peakHeight);
  });

  it("warmer temps produce shorter lag than cold temps", () => {
    const warm = generateCurve(12.5, "instant", 30, 24);
    const cold = generateCurve(12.5, "instant", 10, 24);
    expect(warm.lag).toBeLessThan(cold.lag);
  });
});

describe("summarizeCurve / getActivityAtHour", () => {
  it("finds max activity near the modeled peak window", () => {
    const curve = summarizeCurve(generateCurve(12.5, "instant", 22, 24));
    expect(curve.maxActivity).toBeGreaterThan(0);
    expect(curve.maxActivity).toBeLessThanOrEqual(curve.peakHeight);
    expect(getActivityAtHour(curve, 0)).toBe(0);
  });
});

describe("isValidCurveParams", () => {
  it("accepts in-range UI parameters", () => {
    expect(
      isValidCurveParams({ flourProtein: 12.5, yeastType: "instant", tempC: 22, hours: 24 }),
    ).toBe(true);
  });

  it("rejects out-of-range values", () => {
    expect(
      isValidCurveParams({ flourProtein: 7, yeastType: "instant", tempC: 22, hours: 24 }),
    ).toBe(false);
    expect(
      isValidCurveParams({ flourProtein: 12.5, yeastType: "instant", tempC: 22, hours: 80 }),
    ).toBe(false);
  });
});

describe("YEAST_TYPES catalog", () => {
  it("exposes four yeast profiles with unique ids", () => {
    const ids = YEAST_TYPES.map((y) => y.id);
    expect(new Set(ids).size).toBe(4);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });
});
