# Faux Hollows Solver

Statistical tool for solving a mini-game in Final Fantasy XIV.

### [Open the solver](https://p-clements.github.io/FauxHollowsProbabilisticSolver/)

Place information into the grid as it is uncovered in game. Yellow squares with a crosshair are the solver’s suggested next flip.

**First Retelling / Second Retelling** (above the picker) sets sword value for where you are in the minigame. Open **Advanced** for Fox Sightings, strategy values, and stats.

Blocked cells do not consume flips. Long-press a cell to erase it, or use **Undo** for the last mark.

When the solver fills a coffer or swords shape by deduction, select the matching picker item and click an
inferred cell to record that you have actually flipped it; only confirmed flips use the budget.

### Credits

Fork of [Sturalke’s original solver](https://github.com/Sturalke/FauxHollowsProbabilisticSolver)
([original site](https://sturalke.github.io/FauxHollowsProbabilisticSolver/)).
Refactored scoring, retelling presets, mobile-friendly UI, and GitHub Pages hosting for this fork.

## Hosting (GitHub Pages)

- Source: `master` branch, `/` (root)
- Site: https://p-clements.github.io/FauxHollowsProbabilisticSolver/
- Assets use **relative** URLs only (required for project Pages)
- After UI/logic changes, bump the CSS and JS `?v=` values in `index.html` and the matching `CACHE`/asset versions in `sw.js` (same N; see `<!-- asset-version: N -->`)
- Never commit `service_account.json` (Sheets scraper); listed in `.gitignore`

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Formatting

Run the project formatters before committing changes:

```bash
npm install
npm run format
npm run format:check
npm run lint:python
```

Prettier formats the web, JSON, and Markdown files; Ruff formats and checks `scraper.py`. Generated `data.js` is intentionally excluded.

## Deploying to GitHub Pages

1. Bump the CSS and JS `?v=N` values in `index.html` and the matching service-worker cache version in `sw.js`.
2. Push to `master`.
3. Wait for Pages build; hard-refresh once.
