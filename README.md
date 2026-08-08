# Faux Hollows Solver
Statistical tool for solving a mini-game in Final Fantasy XIV.

### [Open the solver](https://p-clements.github.io/FauxHollowsProbabilisticSolver/)

Place information into the grid as it is uncovered in game. Yellow squares with a crosshair are the solver’s suggested next flip.

**First Retelling / Second Retelling** (above the picker) sets sword value for where you are in the minigame. Open **Advanced** for Fox Sightings, weights, and stats.

Blocked cells do not consume flips. Long-press a cell to erase it, or use **Undo** for the last mark.

### Credits
Fork of [Sturalke’s original solver](https://github.com/Sturalke/FauxHollowsProbabilisticSolver)
([original site](https://sturalke.github.io/FauxHollowsProbabilisticSolver/)).
Refactored scoring, retelling presets, mobile-friendly UI, and GitHub Pages hosting for this fork.

## Hosting (GitHub Pages)
- Source: `master` branch, `/` (root)
- Site: https://p-clements.github.io/FauxHollowsProbabilisticSolver/
- Assets use **relative** URLs only (required for project Pages)
- After UI/logic changes, bump `?v=` on **both** CSS and JS in `index.html` (same N; see `<!-- asset-version: N -->`)
- Never commit `service_account.json` (Sheets scraper); listed in `.gitignore`

## Local preview
```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploying to GitHub Pages
1. Bump `?v=N` on **both** `style.css` and `code.js` in `index.html` (same N).
2. Push to `master`.
3. Wait for Pages build; hard-refresh once.
