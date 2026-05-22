/**
 * EXAMPLE: Adding your own curve recipe
 *
 * Copy this file, rename it (e.g. my-bakery.test.ts), and register
 * expectations after running:
 *   npx vitest run tests/recipes.test.ts
 *
 * See tests/OUTLINE.md § "Adding a recipe"
 */
import { describe, it, expect } from "vitest";
import { generateCurve, summarizeCurve } from "@/lib/fermentation";
import type { TestRecipe } from "@/lib/fermentation";

const MY_RECIPE: TestRecipe = {
  id: "example-pizza-preferment",
  name: "Example: Pizza Preferment",
  description: "Template recipe — adjust params to match your workflow.",
  category: "bread",
  params: { flourProtein: 13.5, yeastType: "instant", tempC: 24, hours: 16 },
  // Fill expected values after first exploratory run:
  expected: {
    lag: 0.4,
    peakTime: 3.8,
    peakHeight: 2.72,
    pointCount: 65,
    maxActivity: 2.1,
    activityAtHour0: 0,
  },
};

describe("example: custom recipe workflow", () => {
  it("documents how to validate a new scenario", () => {
    const result = summarizeCurve(
      generateCurve(
        MY_RECIPE.params.flourProtein,
        MY_RECIPE.params.yeastType,
        MY_RECIPE.params.tempC,
        MY_RECIPE.params.hours,
      ),
    );

    // Loose assertion while developing; tighten once expectations are confirmed:
    expect(result.lag).toBeGreaterThan(0);
    expect(result.peakTime).toBeLessThan(MY_RECIPE.params.hours);
    expect(result.pointCount).toBe(MY_RECIPE.params.hours * 4 + 1);
  });
});
