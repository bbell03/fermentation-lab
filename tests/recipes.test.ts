import { describe, it, expect } from "vitest";
import { generateCurve, summarizeCurve } from "@/lib/fermentation";
import { CURVE_RECIPES, getRecipeById, recipesByCategory } from "./recipes/curve-recipes";

describe("curve test recipes", () => {
  it.each(CURVE_RECIPES)("$name ($id)", (recipe) => {
    const result = summarizeCurve(
      generateCurve(
        recipe.params.flourProtein,
        recipe.params.yeastType,
        recipe.params.tempC,
        recipe.params.hours,
      ),
    );

    expect(result.lag).toBe(recipe.expected.lag);
    expect(result.peakTime).toBe(recipe.expected.peakTime);
    expect(result.peakHeight).toBe(recipe.expected.peakHeight);
    expect(result.pointCount).toBe(recipe.expected.pointCount);
    expect(result.maxActivity).toBeCloseTo(recipe.expected.maxActivity, 3);
    expect(result.activityAtHour0).toBe(recipe.expected.activityAtHour0);
  });
});

describe("recipe catalog helpers", () => {
  it("looks up recipes by id", () => {
    expect(getRecipeById("warm-fresh")?.name).toBe("Warm Fresh Yeast Bulk");
    expect(getRecipeById("missing")).toBeUndefined();
  });

  it("filters by category", () => {
    const sourdough = recipesByCategory("sourdough");
    expect(sourdough).toHaveLength(1);
    expect(sourdough[0].id).toBe("cold-wild");
  });

  it("covers all yeast types across the catalog", () => {
    const yeastUsed = new Set(CURVE_RECIPES.map((r) => r.params.yeastType));
    expect(yeastUsed).toContain("instant");
    expect(yeastUsed).toContain("fresh");
    expect(yeastUsed).toContain("wild");
    expect(yeastUsed).toContain("active");
  });
});
