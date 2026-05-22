export type LabTheme = {
  accent: string;
  accentFaint: string;
  accentSoft: string;
  accentDim: string;
  accentGlow: string;
  sensorColors: [string, string, string, string];
  lineGradient: { start: string; mid: string; end: string };
};

export type ThemePreset = {
  id: string;
  label: string;
  hex: string;
};

/** Hue offsets for the four environment channels (°). */
const SENSOR_HUE_OFFSETS = [0, 55, 125, 210] as const;

export const THEME_PRESETS: ThemePreset[] = [
  { id: "volt", label: "Volt", hex: "#C8F55A" },
  { id: "cyan", label: "Cyan", hex: "#5AC8F5" },
  { id: "ember", label: "Ember", hex: "#F5A55A" },
  { id: "violet", label: "Violet", hex: "#C55AF5" },
  { id: "mint", label: "Mint", hex: "#5AF5C8" },
  { id: "rose", label: "Rose", hex: "#F55A9A" },
];

export function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function shiftHue(hex: string, degrees: number): string {
  const { r, g, b } = parseHex(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return hslToHex(h + degrees, Math.min(92, s + 4), Math.min(72, Math.max(48, l)));
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function generateTheme(accent: string): LabTheme {
  const normalized = accent.startsWith("#") ? accent.toUpperCase() : `#${accent}`.toUpperCase();
  const sensorColors = SENSOR_HUE_OFFSETS.map((deg) => shiftHue(normalized, deg)) as [
    string,
    string,
    string,
    string,
  ];

  return {
    accent: normalized,
    accentFaint: rgba(normalized, 0.07),
    accentSoft: rgba(normalized, 0.18),
    accentDim: rgba(normalized, 0.25),
    accentGlow: rgba(normalized, 0.4),
    sensorColors,
    lineGradient: {
      start: rgba(normalized, 0.25),
      mid: normalized,
      end: rgba(normalized, 0.35),
    },
  };
}

export function applySensorColors<T extends { color: string }>(sensors: T[], colors: string[]): T[] {
  return sensors.map((s, i) => ({ ...s, color: colors[i] ?? colors[0] }));
}
