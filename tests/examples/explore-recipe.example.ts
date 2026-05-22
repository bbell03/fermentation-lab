/**
 * EXAMPLE: Explore a scenario and print metrics for copy-paste into curve-recipes.ts
 *
 * Run:
 *   npx tsx tests/examples/explore-recipe.example.ts
 */
import { generateCurve, summarizeCurve } from "@/lib/fermentation";

const params = {
  flourProtein: 14,
  yeastType: "active",
  tempC: 18,
  hours: 36,
};

const summary = summarizeCurve(
  generateCurve(params.flourProtein, params.yeastType, params.tempC, params.hours),
);

console.log("Params:", params);
console.log("Expected block for curve-recipes.ts:");
console.log(
  JSON.stringify(
    {
      lag: summary.lag,
      peakTime: summary.peakTime,
      peakHeight: summary.peakHeight,
      pointCount: summary.pointCount,
      maxActivity: summary.maxActivity,
      activityAtHour0: summary.activityAtHour0,
    },
    null,
    2,
  ),
);
