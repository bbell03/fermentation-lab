import { describe, it, expect } from "vitest";
import { generateTheme, shiftHue, THEME_PRESETS } from "@/lib/theme";

describe("generateTheme", () => {
  it("builds four distinct sensor colors from one accent", () => {
    const theme = generateTheme("#C8F55A");
    const unique = new Set(theme.sensorColors);
    expect(unique.size).toBe(4);
    expect(theme.accent).toBe("#C8F55A");
  });

  it("derives rgba accent variants", () => {
    const theme = generateTheme("#5AC8F5");
    expect(theme.accentFaint).toMatch(/^rgba\(/);
    expect(theme.lineGradient.mid).toBe("#5AC8F5");
  });

  it("covers all presets", () => {
    THEME_PRESETS.forEach((preset) => {
      const theme = generateTheme(preset.hex);
      expect(theme.sensorColors).toHaveLength(4);
    });
  });
});

describe("shiftHue", () => {
  it("returns valid hex", () => {
    expect(shiftHue("#C8F55A", 55)).toMatch(/^#[0-9A-F]{6}$/);
  });
});
