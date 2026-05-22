export type YeastType = {
  id: string;
  label: string;
  multiplier: number;
  lag: number;
};

export type CurvePoint = {
  hour: number;
  activity: number;
};

export type CurveResult = {
  points: CurvePoint[];
  peakTime: number;
  peakHeight: number;
  lag: number;
};

export type Sensor = {
  base: number;
  noise: number;
  unit: string;
  label: string;
  lo: number;
  hi: number;
  color: string;
  history: { v: number }[];
};

export type CurveParams = {
  flourProtein: number;
  yeastType: string;
  tempC: number;
  hours: number;
};

export type RecipeExpectations = {
  lag: number;
  peakTime: number;
  peakHeight: number;
  pointCount: number;
  maxActivity: number;
  activityAtHour0: number;
};

export type TestRecipe = {
  id: string;
  name: string;
  description: string;
  category: "bread" | "sourdough" | "edge-case" | "benchmark";
  params: CurveParams;
  expected: RecipeExpectations;
  notes?: string;
};
