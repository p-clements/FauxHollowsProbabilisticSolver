// Look-ahead planning over the community sheet's known layouts. DOM-free so it can run in
// the page, in planner-worker.js, and in scripts/benchmark.js.
//
// Cell codes match fhs_grid: 0 empty, 1 blocked, 3 coffer, 4 swords, 5 fox.
// Observations use the same codes plus 2 (missed, i.e. empty) and -1 (not flipped).
// A "world" is one complete game: a sheet layout plus where the Fox is, or no Fox at all.
"use strict";

var FHS_PIECES = [5, 3, 4];
var FHS_PIECE_SIZE = { 5: 1, 3: 4, 4: 6 };
var FHS_OUTCOMES = [0, 3, 4, 5];
var FHS_MAX_WORLDS = 96;

function FhsIdentifyPatternFromBlocked(blockedCells, patterns) {
	var sorted = blockedCells.slice().sort(function (a, b) {
		return a - b;
	});
	if (sorted.length !== 5) return -1;
	for (var i = 0; i < patterns.length; i++) {
		if (patterns[i].join(",") === sorted.join(",")) return i;
	}
	return -1;
}

// Sheet board codes: 1 blocked, 2 coffer, 3 swords, 4 verified fox spot, 5 fox sighting.
// Each layout is equally likely. With chance foxChance the Fox is present, at one of the
// layout's verified spots (equally likely); otherwise the game has no Fox.
// Returns { worlds: Int8Array[36][], weights: number[] } with weights summing to 1.
function FhsSheetWorlds(sheetBoards, foxChance) {
	var worlds = [];
	var weights = [];
	sheetBoards.forEach(function (board) {
		var flat = [].concat.apply([], board);
		var base = flat.map(function (v) {
			if (v === 1) return 1;
			if (v === 2) return 3;
			if (v === 3) return 4;
			return 0;
		});
		var spots = [];
		flat.forEach(function (v, k) {
			if (v === 4) spots.push(k);
		});
		var boardWeight = 1 / sheetBoards.length;
		var present = spots.length ? foxChance : 0;
		spots.forEach(function (k) {
			if (present <= 0) return;
			var w = Int8Array.from(base);
			w[k] = 5;
			worlds.push(w);
			weights.push((boardWeight * present) / spots.length);
		});
		if (present < 1) {
			worlds.push(Int8Array.from(base));
			weights.push(boardWeight * (1 - present));
		}
	});
	return { worlds: worlds, weights: weights };
}

function FhsMatchesObservation(world, obs) {
	for (var k = 0; k < 36; k++) {
		var o = obs[k];
		if (o === -1) continue;
		if (o === 2) {
			if (world[k] !== 0) return false;
		} else if (world[k] !== o) {
			return false;
		}
	}
	return true;
}

function FhsConsistentWorlds(worlds, obs) {
	var out = [];
	for (var i = 0; i < worlds.length; i++) {
		if (FhsMatchesObservation(worlds[i], obs)) out.push(i);
	}
	return out;
}

// Per-cell chance of each piece across the given worlds, plus the chance a Fox is present.
function FhsWorldProbabilities(sheet, W) {
	var probs = { 5: new Array(36).fill(0), 3: new Array(36).fill(0), 4: new Array(36).fill(0), foxPresent: 0 };
	var total = 0;
	W.forEach(function (i) {
		total += sheet.weights[i];
	});
	if (!total) return probs;
	W.forEach(function (i) {
		var w = sheet.worlds[i];
		var share = sheet.weights[i] / total;
		var hasFox = false;
		for (var k = 0; k < 36; k++) {
			if (probs[w[k]]) probs[w[k]][k] += share;
			if (w[k] === 5) hasFox = true;
		}
		if (hasFox) probs.foxPresent += share;
	});
	return probs;
}

function fhsPopcount(x) {
	x = x - ((x >>> 1) & 0x55555555);
	x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
	return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

// sheet: from FhsSheetWorlds. values: { 5: fox, 3: coffer, 4: swords }.
// needs: cells of each piece that must be flipped for it to pay out (default: all of them).
// Sets of worlds are held as three 32-bit masks (a, b, c), so up to 96 worlds.
function FhsPlanner(sheet, values, needs) {
	if (sheet.worlds.length > FHS_MAX_WORLDS) {
		throw new Error("FhsPlanner supports at most " + FHS_MAX_WORLDS + " worlds");
	}
	this.worlds = sheet.worlds;
	this.values = values;
	this.needs = needs || FHS_PIECE_SIZE;
	this.memo = new Map();
	this.size = 0;
	this.ceilings = new Float64Array(2 * 5 * 7 * 12).fill(-1);
	this.masks = {};
	var self = this;
	FHS_OUTCOMES.concat([1]).forEach(function (code) {
		self.masks[code] = [new Uint32Array(36), new Uint32Array(36), new Uint32Array(36)];
	});
	sheet.worlds.forEach(function (w, i) {
		var word = i >> 5;
		var bit = 1 << (i & 31);
		for (var k = 0; k < 36; k++) {
			var m = self.masks[w[k]][word];
			m[k] = (m[k] | bit) >>> 0;
		}
	});
	// Weight of any 8-bit slice of a mask, so a set's total weight is 12 table lookups.
	this.byteWeights = [];
	for (var slice = 0; slice < 12; slice++) {
		var table = new Float64Array(256);
		for (var byte = 1; byte < 256; byte++) {
			var low = byte & -byte;
			var idx = slice * 8 + Math.log2(low);
			table[byte] = table[byte ^ low] + (idx < sheet.weights.length ? sheet.weights[idx] : 0);
		}
		this.byteWeights.push(table);
	}
}

FhsPlanner.prototype.weight = function (a, b, c) {
	var t = this.byteWeights;
	return (
		t[0][a & 255] +
		t[1][(a >>> 8) & 255] +
		t[2][(a >>> 16) & 255] +
		t[3][a >>> 24] +
		t[4][b & 255] +
		t[5][(b >>> 8) & 255] +
		t[6][(b >>> 16) & 255] +
		t[7][b >>> 24] +
		t[8][c & 255] +
		t[9][(c >>> 8) & 255] +
		t[10][(c >>> 16) & 255] +
		t[11][c >>> 24]
	);
};

// W: consistent world indices; counts: flipped cells per piece as [fox, coffer, swords];
// r: flips left. Returns the expected value of playing on optimally and the next move:
// either an informative cell to flip, or the pieces to finish using already-certain cells.
FhsPlanner.prototype.best = function (W, counts, r) {
	var m = [0, 0, 0];
	W.forEach(function (i) {
		m[i >> 5] = (m[i >> 5] | (1 << (i & 31))) >>> 0;
	});
	var needs = this.needs;
	var c = counts.map(function (n, i) {
		return Math.min(n, needs[FHS_PIECES[i]]);
	});
	return this.solve(m[0], m[1], m[2], c[0], c[1], c[2], r);
};

FhsPlanner.prototype.solve = function (a, b, c, cf, cc, cs, r) {
	var byA = this.memo.get(a);
	if (!byA) {
		byA = new Map();
		this.memo.set(a, byA);
	}
	var byB = byA.get(b);
	if (!byB) {
		byB = new Map();
		byA.set(b, byB);
	}
	var key = c * 4096 + ((((r * 2 + cf) * 5 + cc) * 7 + cs) | 0);
	var hit = byB.get(key);
	if (hit) return hit;

	var counts = [cf, cc, cs];
	var count = fhsPopcount(a) + fhsPopcount(b) + fhsPopcount(c);
	var collected = 0;
	var finishable = [];
	for (var pi = 0; pi < 3; pi++) {
		var p = FHS_PIECES[pi];
		if (counts[pi] >= this.needs[p]) {
			collected += this.values[p];
			continue;
		}
		var pm = this.masks[p];
		var agreed = 0;
		for (var k = 0; k < 36; k++) {
			if ((pm[0][k] & a) >>> 0 === a && (pm[1][k] & b) >>> 0 === b && (pm[2][k] & c) >>> 0 === c) agreed++;
		}
		// agreed counts the piece's flipped cells too, so this means enough certain cells remain.
		if (agreed >= this.needs[p]) {
			finishable.push({ piece: p, need: this.needs[p] - counts[pi], value: this.values[p] });
		}
	}

	var cashValue = 0;
	var cashPieces = [];
	for (var mask = 0; mask < 1 << finishable.length; mask++) {
		var cost = 0;
		var gain = 0;
		var chosen = [];
		for (var f = 0; f < finishable.length; f++) {
			if ((mask >> f) & 1) {
				cost += finishable[f].need;
				gain += finishable[f].value;
				chosen.push(finishable[f].piece);
			}
		}
		if (cost <= r && gain > cashValue) {
			cashValue = gain;
			cashPieces = chosen;
		}
	}

	var result = { value: collected + cashValue, cell: -1, finish: cashPieces };
	var ceiling = this.ceiling(counts, r);
	if (r > 0 && count > 1 && result.value < ceiling - 1e-9) {
		var moves = this.moves(a, b, c);
		for (var m = 0; m < moves.length && result.value < ceiling - 1e-9; m++) {
			var groups = moves[m].groups;
			var optimistic = 0;
			for (var q = 0; q < groups.length; q++) {
				optimistic += groups[q].share * this.ceiling(this.bump(counts, groups[q].code), r - 1);
			}
			if (optimistic <= result.value + 1e-9) continue;
			var ev = 0;
			for (var g = 0; g < groups.length; g++) {
				var grp = groups[g];
				var next = this.bump(counts, grp.code);
				var child = this.solve(grp.a, grp.b, grp.c, next[0], next[1], next[2], r - 1).value;
				ev += grp.share * child;
				optimistic += grp.share * (child - this.ceiling(next, r - 1));
				if (optimistic <= result.value + 1e-9) break;
			}
			if (optimistic > result.value + 1e-9) {
				result = { value: ev, cell: moves[m].cell, finish: [] };
			}
		}
	}
	byB.set(key, result);
	this.size++;
	return result;
};

FhsPlanner.prototype.bump = function (counts, code) {
	var idx = FHS_PIECES.indexOf(code);
	if (idx < 0 || counts[idx] >= this.needs[code]) return counts;
	var next = counts.slice();
	next[idx]++;
	return next;
};

// Most a state could still earn if the board were fully known: finish whichever pieces fit.
FhsPlanner.prototype.ceiling = function (counts, r) {
	var slot = ((counts[0] * 5 + counts[1]) * 7 + counts[2]) * 12 + r;
	var cached = this.ceilings[slot];
	if (cached >= 0) return cached;
	var base = 0;
	var best = 0;
	for (var pi = 0; pi < 3; pi++) {
		if (counts[pi] >= this.needs[FHS_PIECES[pi]]) base += this.values[FHS_PIECES[pi]];
	}
	for (var mask = 1; mask < 8; mask++) {
		var cost = 0;
		var gain = 0;
		var ok = true;
		for (var i = 0; i < 3; i++) {
			if (!((mask >> i) & 1)) continue;
			var need = this.needs[FHS_PIECES[i]] - counts[i];
			if (need <= 0) {
				ok = false;
				break;
			}
			cost += need;
			gain += this.values[FHS_PIECES[i]];
		}
		if (ok && cost <= r && gain > best) best = gain;
	}
	this.ceilings[slot] = base + best;
	return base + best;
};

// Informative cells, one per distinct way of splitting the worlds, most promising first.
FhsPlanner.prototype.moves = function (a, b, c) {
	var total = this.weight(a, b, c);
	var seen = new Set();
	var moves = [];
	for (var k = 0; k < 36; k++) {
		var groups = [];
		var pieceShare = 0;
		for (var o = 0; o < FHS_OUTCOMES.length; o++) {
			var code = FHS_OUTCOMES[o];
			var m = this.masks[code];
			var ga = (m[0][k] & a) >>> 0;
			var gb = (m[1][k] & b) >>> 0;
			var gc = (m[2][k] & c) >>> 0;
			if (!ga && !gb && !gc) continue;
			var share = this.weight(ga, gb, gc) / total;
			groups.push({ code: code, a: ga, b: gb, c: gc, share: share });
			if (code !== 0) pieceShare += share;
		}
		if (groups.length < 2) continue;
		var sig = "";
		for (var s = 0; s < groups.length; s++) {
			sig += groups[s].code + ":" + groups[s].a + ":" + groups[s].b + ":" + groups[s].c + ";";
		}
		if (seen.has(sig)) continue;
		seen.add(sig);
		moves.push({ cell: k, groups: groups, order: pieceShare });
	}
	moves.sort(function (x, y) {
		return y.order - x.order;
	});
	return moves;
};

// One-step move used when the board is not in the sheet. probs: { 5, 3, 4 } per-cell chances;
// obs: per-cell observation (-1 unflipped); counts: [fox, coffer, swords] flipped; r: flips left.
// Certain cells teach nothing, so they are held back until the flips left are only enough to
// finish the pieces they complete. Pieces that can no longer be finished are worth nothing.
function FhsGreedyMove(probs, obs, counts, r, values, needs) {
	needs = needs || FHS_PIECE_SIZE;
	var need = {};
	var worth = {};
	var certain = { 5: [], 3: [], 4: [] };
	FHS_PIECES.forEach(function (p, pi) {
		need[p] = Math.max(0, needs[p] - counts[pi]);
		worth[p] = need[p] > 0 && need[p] <= r ? values[p] : 0;
	});
	for (var k = 0; k < 36; k++) {
		if (obs[k] !== -1) continue;
		FHS_PIECES.forEach(function (p) {
			if (probs[p][k] >= 1 - 1e-9) certain[p].push(k);
		});
	}

	var finish = [];
	var reserved = 0;
	var reservedValue = 0;
	var determined = FHS_PIECES.filter(function (p) {
		return need[p] > 0 && certain[p].length >= need[p] && worth[p] > 0;
	});
	for (var mask = 1; mask < 1 << determined.length; mask++) {
		var cost = 0;
		var gain = 0;
		var chosen = [];
		determined.forEach(function (p, i) {
			if ((mask >> i) & 1) {
				cost += need[p];
				gain += worth[p];
				chosen.push(p);
			}
		});
		if (cost <= r && gain > reservedValue) {
			reserved = cost;
			reservedValue = gain;
			finish = chosen;
		}
	}

	var scores = new Array(36).fill(0);
	var bestCell = -1;
	var bestScore = 0;
	var ties = [];
	for (var c = 0; c < 36; c++) {
		if (obs[c] !== -1) continue;
		var isCertain = FHS_PIECES.some(function (p) {
			return probs[p][c] >= 1 - 1e-9;
		});
		if (isCertain) continue;
		var s = 0;
		FHS_PIECES.forEach(function (p) {
			s += worth[p] * probs[p][c];
		});
		scores[c] = s;
		if (s > bestScore + 1e-9) {
			bestScore = s;
			bestCell = c;
			ties = [c];
		} else if (s > 0 && Math.abs(s - bestScore) <= 1e-9) {
			ties.push(c);
		}
	}

	if (bestCell >= 0 && r > reserved) {
		return { cell: bestCell, ties: ties, finish: [], scores: scores };
	}
	return { cell: -1, ties: [], finish: finish, scores: scores };
}

if (typeof module !== "undefined") {
	module.exports = {
		FHS_PIECES: FHS_PIECES,
		FHS_PIECE_SIZE: FHS_PIECE_SIZE,
		FhsIdentifyPatternFromBlocked: FhsIdentifyPatternFromBlocked,
		FhsSheetWorlds: FhsSheetWorlds,
		FhsConsistentWorlds: FhsConsistentWorlds,
		FhsWorldProbabilities: FhsWorldProbabilities,
		FhsPlanner: FhsPlanner,
		FhsGreedyMove: FhsGreedyMove
	};
}
