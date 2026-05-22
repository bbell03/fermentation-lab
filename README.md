# Fermentation Lab

Interactive concept app for modeling yeast fermentation activity curves and simulating a live fermentation environment (temperature, humidity, CO₂, pH).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

This is a standard [Next.js](https://nextjs.org) App Router project and deploys cleanly to [Vercel](https://vercel.com):

1. Push this folder to a Git repository.
2. Import the repo in Vercel (framework preset: **Next.js**).
3. Deploy — no extra configuration required.

Other hosts: run `npm run build` then `npm start` (Node 18+).

## Project structure

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Home route |
| `components/FermentationLab.tsx` | Main UI (client component) |
| `lib/fermentation/` | Curve + sensor model (shared with tests) |
| `tests/` | Vitest suite, recipes, examples |
| `tests/OUTLINE.md` | Testing strategy & how to extend |
| `fermentation-lab.jsx` | Original standalone prototype |

## Testing

See **[tests/OUTLINE.md](tests/OUTLINE.md)** for the full testing strategy, recipe catalog, and how to add scenarios.

```bash
npm test              # watch mode
npm run test:run      # CI-style single run
npm run test:coverage # coverage on lib/fermentation
npm run test:explore  # print metrics for a new recipe
```

**Curve recipes** (`tests/recipes/curve-recipes.ts`): 8 named scenarios (standard instant rise, cold wild, edge temps, etc.)

**Sensor scenarios** (`tests/recipes/sensor-scenarios.ts`): nominal, high temp, CO₂ spike, low pH

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm start` — serve production build
- `npm run test:run` — run test suite
