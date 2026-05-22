import { YEAST_TYPES } from "./constants";
import type { CurveParams, CurveResult } from "./types";

export function generateCurve(
  flourProtein: number,
  yeastType: string,
  tempC: number,
  hours: number,
): CurveResult {
  const yeast = YEAST_TYPES.find((y) => y.id === yeastType) || YEAST_TYPES[0];
  const proteinFactor = 0.6 + (flourProtein - 8) / 20;
  const tempFactor = Math.max(0.1, Math.min(2.5, (tempC - 4) / 16));
  const lag = yeast.lag / tempFactor;
  const peakTime = (3.5 + lag) / (yeast.multiplier * tempFactor * proteinFactor);
  const peakHeight = 2.8 * yeast.multiplier * proteinFactor * Math.min(tempFactor, 1.6);
  const points = [];

  for (let h = 0; h <= hours; h += 0.25) {
    let activity;
    if (h < lag) {
      activity = 0.02 * (h / lag);
    } else {
      const t = h - lag;
      const rise = peakHeight * (1 - Math.exp(-1.4 * t / (peakTime - lag)));
      const decay = Math.exp(-0.18 * Math.max(0, t - (peakTime - lag) * 1.1));
      activity = rise * decay;
    }
    points.push({ hour: h, activity: Math.max(0, +activity.toFixed(3)) });
  }

  return {
    points,
    peakTime: +peakTime.toFixed(1),
    peakHeight: +peakHeight.toFixed(2),
    lag: +lag.toFixed(1),
  };
}

export function summarizeCurve(result: CurveResult) {
  const maxActivity = Math.max(...result.points.map((p) => p.activity));
  return {
    ...result,
    maxActivity,
    activityAtHour0: result.points[0]?.activity ?? 0,
    pointCount: result.points.length,
  };
}

export function getActivityAtHour(result: CurveResult, hour: number) {
  return (
    result.points.find((p) => p.hour === hour)?.activity ??
    result.points.reduce((best, p) =>
      Math.abs(p.hour - hour) < Math.abs(best.hour - hour) ? p : best,
    result.points[0]
    ).activity
  );
}

export function isValidCurveParams(params: CurveParams): boolean {
  return (
    params.flourProtein >= 8 &&
    params.flourProtein <= 16 &&
    params.tempC >= 4 &&
    params.tempC <= 38 &&
    params.hours >= 6 &&
    params.hours <= 72 &&
    YEAST_TYPES.some((y) => y.id === params.yeastType)
  );
}
