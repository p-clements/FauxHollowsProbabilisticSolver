// Plays every known sheet layout under each strategy and reports how often each piece is
// completed within the flip budget, plus the average value earned.
// Usage: node scripts/benchmark.js [runsPerGame] [foxChance]
//
// foxChance (default 0.5) is both how often games have a Fox and what the sheet strategies assume.
//
// The games come from the community sheet, so strategies that use the sheet are scored on the
// same layouts they plan with. Treat their numbers as "if the sheet is complete and accurate".
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const code = fs.readFileSync(path.join(root, "code.js"), "utf8");
const P = require(path.join(root, "planner.js"));

function extract(src, start) {
	const i = src.indexOf(start);
	if (i < 0) throw new Error("Not found in code.js: " + start);
	const isFn = start.startsWith("function");
	const open = src.indexOf(isFn ? "{" : "[", i);
	const close = isFn ? "}" : "]";
	let depth = 0;
	for (let p = open; p < src.length; p++) {
		if (src[p] === src[open]) depth++;
		else if (src[p] === close && --depth === 0) return src.slice(i, p + 1);
	}
	throw new Error("Unbalanced: " + start);
}

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "data.js"), "utf8").replace(/^const /m, "var "), ctx);
vm.runInContext(
	[
		extract(code, "const fhs_sheet_patterns").replace(/^const /, "var "),
		extract(code, "function PrefillArray("),
		extract(code, "function CalculateFullProb(")
	].join("\n"),
	ctx
);

const BUDGET = 11;
const PIECES = P.FHS_PIECES;
const SIZE = P.FHS_PIECE_SIZE;
// Mirrors fhs_game_presets in code.js: values per piece, and swords cells needed to pay out.
const PRESETS = {
	"First Retelling": { values: { 5: 10, 3: 70, 4: 100 }, needs: { 5: 1, 3: 4, 4: 6 } },
	"Second Retelling": { values: { 5: 50, 3: 50, 4: 60 }, needs: { 5: 1, 3: 4, 4: 1 } }
};

const FOX_CHANCE = process.argv[3] === undefined ? 0.5 : Number(process.argv[3]);
const sheets = ctx.fhs_sheet_fox.map((boards) => P.FhsSheetWorlds(boards, FOX_CHANCE));

// Every sheet world is a game, weighted by how likely it is; block patterns are equally likely.
function buildGames() {
	const games = [];
	sheets.forEach((sheet, pattern) => {
		sheet.worlds.forEach((truth, i) => {
			games.push({ pattern, truth, weight: sheet.weights[i] / sheets.length, hasFox: truth.includes(5) });
		});
	});
	return games;
}

// State seen by a strategy: obs per cell (-1 unflipped, 1 blocked, 2 missed, 3/4/5 piece),
// counts of flipped cells per piece [fox, coffer, swords], and flips left.
function geometricProbs(obs) {
	const grid = [];
	for (let i = 0; i < 6; i++) grid.push(obs.slice(i * 6, i * 6 + 6).map((v) => (v === -1 ? 0 : v)));
	ctx.window.fhs_grid = grid;
	const p = ctx.CalculateFullProb();
	return { 5: p[0].flat(), 3: p[1].flat(), 4: p[2].flat() };
}

function pick(cells, rand) {
	return cells[Math.floor(rand() * cells.length)];
}

function scoreStrategy(score) {
	return (state, values, rand) => {
		const probs = geometricProbs(state.obs);
		let best = -Infinity;
		let ties = [];
		for (let k = 0; k < 36; k++) {
			if (state.obs[k] !== -1) continue;
			const s = score(probs, k, state, values);
			if (s > best + 1e-9) {
				best = s;
				ties = [k];
			} else if (Math.abs(s - best) <= 1e-9) ties.push(k);
		}
		return ties.length ? pick(ties, rand) : -1;
	};
}

function certainCellOf(piece, probs, obs) {
	for (let k = 0; k < 36; k++) if (obs[k] === -1 && probs[piece][k] >= 1 - 1e-9) return k;
	return -1;
}

function greedyStrategy(probsFor) {
	return (state, values, rand) => {
		const probs = probsFor(state);
		const move = P.FhsGreedyMove(probs, state.obs, state.counts, state.r, values, state.needs);
		if (move.cell >= 0) return pick(move.ties, rand);
		if (move.finish.length) return certainCellOf(move.finish[0], probs, state.obs);
		return -1;
	};
}

function sheetProbs(state) {
	const sheet = sheets[state.pattern];
	return P.FhsWorldProbabilities(sheet, P.FhsConsistentWorlds(sheet.worlds, state.obs));
}

const planners = new Map();
function plannerStrategy(state, values) {
	const key = state.pattern + JSON.stringify(values) + JSON.stringify(state.needs);
	const sheet = sheets[state.pattern];
	if (!planners.has(key)) planners.set(key, new P.FhsPlanner(sheet, values, state.needs));
	const W = P.FhsConsistentWorlds(sheet.worlds, state.obs);
	const move = planners.get(key).best(W, state.counts, state.r);
	if (move.cell >= 0) return move.cell;
	if (move.finish.length) return certainCellOf(move.finish[0], P.FhsWorldProbabilities(sheet, W), state.obs);
	return -1;
}

function forkWeighted(state, probs, k, values) {
	const coffer = SIZE[3] - state.counts[1] > state.r ? 0 : values[3];
	const swords = SIZE[4] - state.counts[2] > state.r ? 0 : values[4];
	return values[5] * probs[5][k] + coffer * probs[3][k] + swords * probs[4][k];
}

const strategies = {
	"Upstream Probability": scoreStrategy((p, k) => 1 - (1 - p[5][k]) * (1 - p[3][k]) * (1 - p[4][k])),
	"Current fork (weighted + cutoff)": scoreStrategy((p, k, state, values) => forkWeighted(state, p, k, values)),
	"+ certain cells last": greedyStrategy((state) => geometricProbs(state.obs)),
	"+ sheet odds": greedyStrategy(sheetProbs),
	"+ look-ahead planner": plannerStrategy
};

function mulberry32(seed) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function play(game, strategy, values, needs, rand) {
	const obs = Array.from(game.truth, (v) => (v === 1 ? 1 : -1));
	const counts = [0, 0, 0];
	for (let used = 0; used < BUDGET; used++) {
		const state = { pattern: game.pattern, obs, counts: counts.slice(), r: BUDGET - used, needs };
		const k = strategy(state, values, rand);
		if (k < 0) break;
		const v = game.truth[k];
		obs[k] = v === 0 ? 2 : v;
		const pi = PIECES.indexOf(v);
		if (pi >= 0) counts[pi]++;
		if (PIECES.every((p, i) => counts[i] >= needs[p] || (p === 5 && !game.hasFox))) break;
	}
	return PIECES.map((p, i) => counts[i] >= needs[p]);
}

function main() {
	const runs = Number(process.argv[2]) || 10;
	const games = buildGames();
	console.log(
		`${games.length} games (sheet layout x Fox spot or no Fox), Fox in ${FOX_CHANCE * 100}% of games, ${runs} runs each\n`
	);
	for (const [preset, { values, needs }] of Object.entries(PRESETS)) {
		const rows = [];
		for (const [name, strategy] of Object.entries(strategies)) {
			const t0 = Date.now();
			const done = [0, 0, 0];
			let value = 0;
			let foxWeight = 0;
			games.forEach((game, gi) => {
				const w = game.weight / runs;
				if (game.hasFox) foxWeight += game.weight;
				for (let r = 0; r < runs; r++) {
					const result = play(game, strategy, values, needs, mulberry32(gi * 1000 + r + 1));
					result.forEach((ok, i) => {
						done[i] += ok * w;
						if (ok) value += values[PIECES[i]] * w;
					});
				}
			});
			const pct = (n, of = 1) => (of ? ((100 * n) / of).toFixed(1) : "-");
			rows.push({
				Strategy: name,
				"Fox % (when present)": pct(done[0], foxWeight),
				"Coffer %": pct(done[1]),
				"Swords %": pct(done[2]),
				"Avg value": value.toFixed(1),
				secs: ((Date.now() - t0) / 1000).toFixed(1)
			});
		}
		console.log(
			`${preset} (Fox ${values[5]}, coffer ${values[3]}, swords ${values[4]} for ${needs[4]} cell${needs[4] === 1 ? "" : "s"})`
		);
		console.table(rows);
	}
}

main();
