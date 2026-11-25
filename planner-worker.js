// Runs the look-ahead planner off the main thread. One planner (and its cache) is kept per
// board pattern, Fox chance and set of strategy values, so later moves in a game are instant.
importScripts("data.js", "planner.js?v=28");

var fhs_cached = null;

onmessage = function (e) {
	var d = e.data;
	var key =
		d.pattern + "|" + d.foxChance + "|" + d.values[5] + "," + d.values[3] + "," + d.values[4] + "|" + d.needs[4];
	if (!fhs_cached || fhs_cached.key !== key) {
		fhs_cached = {
			key: key,
			planner: new FhsPlanner(FhsSheetWorlds(fhs_sheet_fox[d.pattern], d.foxChance), d.values, d.needs)
		};
	}
	postMessage({ id: d.id, result: fhs_cached.planner.best(d.W, d.counts, d.r) });
};
