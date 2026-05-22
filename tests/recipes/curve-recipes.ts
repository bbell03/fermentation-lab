import type { TestRecipe } from "@/lib/fermentation";

/**
 * Canonical fermentation scenarios used across the test suite.
 * Expected metrics were generated from the curve model (see tests/OUTLINE.md).
 */
export const CURVE_RECIPES: TestRecipe[] = [
  {
    id: "standard-instant",
    name: "Standard Instant Rise",
    description: "Default bench dough: 12.5% protein, instant dry yeast, room temperature.",
    category: "bread",
    params: { flourProtein: 12.5, yeastType: "instant", tempC: 22, hours: 24 },
    expected: {
      lag: 0.4,
      peakTime: 4.2,
      peakHeight: 2.6,
      pointCount: 97,
      maxActivity: 2.022,
      activityAtHour0: 0,
    },
    notes: "Matches the app's default slider positions on the Activity Curve tab.",
  },
  {
    id: "warm-fresh",
    name: "Warm Fresh Yeast Bulk",
    description: "Higher temp with fresh cake yeast for a fast bulk fermentation.",
    category: "bread",
    params: { flourProtein: 11, yeastType: "fresh", tempC: 28, hours: 18 },
    expected: {
      lag: 0.2,
      peakTime: 2.9,
      peakHeight: 3.62,
      pointCount: 73,
      maxActivity: 2.831,
      activityAtHour0: 0,
    },
    notes: "Expect the shortest lag and one of the highest peak heights in the catalog.",
  },
  {
    id: "cold-wild",
    name: "Cold Wild Ferment",
    description: "Long, slow sourdough-style ferment at 12°C.",
    category: "sourdough",
    params: { flourProtein: 13, yeastType: "wild", tempC: 12, hours: 48 },
    expected: {
      lag: 5,
      peakTime: 36.4,
      peakHeight: 0.65,
      pointCount: 193,
      maxActivity: 0.514,
      activityAtHour0: 0,
    },
    notes: "Peak activity stays low; timeline needs a 48h window to capture the curve.",
  },
  {
    id: "high-protein-active",
    name: "High-Protein Active Dry",
    description: "Strong flour with active dry yeast at moderate temperature.",
    category: "bread",
    params: { flourProtein: 16, yeastType: "active", tempC: 20, hours: 24 },
    expected: {
      lag: 1.2,
      peakTime: 5.5,
      peakHeight: 2.38,
      pointCount: 97,
      maxActivity: 1.863,
      activityAtHour0: 0,
    },
  },
  {
    id: "edge-cold",
    name: "Cold Floor (4°C)",
    description: "Minimum temperature slider — retarded ferment.",
    category: "edge-case",
    params: { flourProtein: 12.5, yeastType: "instant", tempC: 4, hours: 24 },
    expected: {
      lag: 5,
      peakTime: 103,
      peakHeight: 0.23,
      pointCount: 97,
      maxActivity: 0.055,
      activityAtHour0: 0,
    },
    notes: "Peak time exceeds the 24h window; curve barely develops in-view.",
  },
  {
    id: "edge-warm",
    name: "Warm Ceiling (38°C)",
    description: "Maximum temperature — very fast activity spike.",
    category: "edge-case",
    params: { flourProtein: 12.5, yeastType: "instant", tempC: 38, hours: 12 },
    expected: {
      lag: 0.2,
      peakTime: 2.1,
      peakHeight: 3.7,
      pointCount: 49,
      maxActivity: 2.907,
      activityAtHour0: 0,
    },
  },
  {
    id: "short-window",
    name: "Short 6h Window",
    description: "Minimum time window — verifies sampling density at the low bound.",
    category: "benchmark",
    params: { flourProtein: 12.5, yeastType: "instant", tempC: 22, hours: 6 },
    expected: {
      lag: 0.4,
      peakTime: 4.2,
      peakHeight: 2.6,
      pointCount: 25,
      maxActivity: 2.022,
      activityAtHour0: 0,
    },
    notes: "Metrics match standard-instant; only point count changes.",
  },
  {
    id: "long-window",
    name: "Long 72h Window",
    description: "Maximum time window — verifies extended timeline sampling.",
    category: "benchmark",
    params: { flourProtein: 12.5, yeastType: "instant", tempC: 22, hours: 72 },
    expected: {
      lag: 0.4,
      peakTime: 4.2,
      peakHeight: 2.6,
      pointCount: 289,
      maxActivity: 2.022,
      activityAtHour0: 0,
    },
  },
];

export function getRecipeById(id: string): TestRecipe | undefined {
  return CURVE_RECIPES.find((r) => r.id === id);
}

export function recipesByCategory(category: TestRecipe["category"]): TestRecipe[] {
  return CURVE_RECIPES.filter((r) => r.category === category);
}
