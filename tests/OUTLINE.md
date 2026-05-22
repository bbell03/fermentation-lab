# Fermentation Lab — Testing Outline

## Purpose

This suite validates the **fermentation curve model** and **environment sensor simulation** that power the UI. Tests are fast, deterministic where possible, and organized around **recipes** (named scenarios with documented expectations).

---

## 1. Architecture

```
lib/fermentation/          ← Pure logic (tested directly)
├── curve.ts               ← Activity curve generation
├── sensors.ts             ← Sensor init, ticks, range checks
├── constants.ts           ← Yeast profiles, defaults
└── types.ts

tests/
├── OUTLINE.md             ← This document
├── curve.test.ts          ← Unit tests for curve math
├── sensors.test.ts        ← Unit tests for sensor helpers
├── recipes.test.ts        ← Recipe-driven regression (parametric)
├── recipes/
│   ├── curve-recipes.ts   ← 8 canonical curve scenarios
│   └── sensor-scenarios.ts← 4 environment edge cases
└── examples/
    ├── custom-recipe.example.test.ts
    └── explore-recipe.example.ts
```

The React UI (`components/FermentationLab.tsx`) imports from `lib/fermentation` so UI and tests share one source of truth.

---

## 2. Test layers

| Layer | File(s) | What it proves |
|-------|---------|----------------|
| **Unit** | `curve.test.ts`, `sensors.test.ts` | Math invariants, bounds, fallbacks |
| **Recipe regression** | `recipes.test.ts` + `recipes/*` | Named bakes match golden metrics |
| **Examples** | `examples/*` | Patterns for extending the catalog |

No browser/E2E layer yet — Recharts rendering is visual; logic is covered in `lib/`.

---

## 3. Curve test recipes

Defined in `tests/recipes/curve-recipes.ts`.

| ID | Category | Scenario |
|----|----------|----------|
| `standard-instant` | bread | Default app settings (12.5%, instant, 22°C, 24h) |
| `warm-fresh` | bread | Fast bulk with fresh yeast at 28°C |
| `cold-wild` | sourdough | 48h cold wild ferment |
| `high-protein-active` | bread | 16% protein, active dry |
| `edge-cold` | edge-case | 4°C floor — peak beyond window |
| `edge-warm` | edge-case | 38°C ceiling — rapid spike |
| `short-window` | benchmark | 6h minimum timeline |
| `long-window` | benchmark | 72h maximum timeline |

Each recipe stores:

- **params** — inputs to `generateCurve`
- **expected** — `lag`, `peakTime`, `peakHeight`, `pointCount`, `maxActivity`, `activityAtHour0`

---

## 4. Sensor scenarios

Defined in `tests/recipes/sensor-scenarios.ts`.

| ID | What it simulates |
|----|-------------------|
| `nominal-baseline` | All channels at default, in range |
| `temperature-high` | Over-threshold chamber heat |
| `co2-spike` | CO₂ above nominal band |
| `ph-low` | Acidification below pH floor |

---

## 5. Commands

```bash
npm test              # watch mode
npm run test:run      # single CI pass
npm run test:coverage # coverage report
```

---

## 6. Adding a recipe

1. Edit params in `tests/examples/explore-recipe.example.ts` (or add a one-off script).
2. Run `npx tsx tests/examples/explore-recipe.example.ts` and copy the printed `expected` block.
3. Append an entry to `tests/recipes/curve-recipes.ts`.
4. Run `npm run test:run` — the parametric test in `recipes.test.ts` picks it up automatically.

---

## 7. Coverage goals (concept app)

- [x] Curve generation for all yeast types
- [x] Slider boundary behavior (temp, hours, protein)
- [x] Sensor range / normalization
- [x] Deterministic sensor ticks via injected `random`
- [ ] Component smoke tests (optional future)
- [ ] E2E tab navigation (optional future)

---

## 8. CI suggestion

```yaml
- run: npm ci
- run: npm run test:run
- run: npm run build
```

---

## 9. Related files

- `lib/fermentation/` — model implementation
- `components/FermentationLab.tsx` — UI consumer
- `fermentation-lab.jsx` — original prototype (not tested)
