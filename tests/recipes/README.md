# Test Recipes & Scenarios

## Curve recipes (`curve-recipes.ts`)

| ID | Name | Yeast | Temp | Hours |
|----|------|-------|------|-------|
| `standard-instant` | Standard Instant Rise | instant | 22°C | 24 |
| `warm-fresh` | Warm Fresh Yeast Bulk | fresh | 28°C | 18 |
| `cold-wild` | Cold Wild Ferment | wild | 12°C | 48 |
| `high-protein-active` | High-Protein Active Dry | active | 20°C | 24 |
| `edge-cold` | Cold Floor (4°C) | instant | 4°C | 24 |
| `edge-warm` | Warm Ceiling (38°C) | instant | 38°C | 12 |
| `short-window` | Short 6h Window | instant | 22°C | 6 |
| `long-window` | Long 72h Window | instant | 22°C | 72 |

## Sensor scenarios (`sensor-scenarios.ts`)

| ID | Trigger |
|----|---------|
| `nominal-baseline` | Default base readings, in range |
| `temperature-high` | 29.5°C (> 28°C max) |
| `co2-spike` | 615 ppm (> 600 max) |
| `ph-low` | 6.3 pH (< 6.5 min) |

Full expectations and notes: see each file and **tests/OUTLINE.md**.
