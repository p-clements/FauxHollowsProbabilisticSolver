const fhs_blocked_icon_url = "images/blocked.png";
const fhs_missed_icon_url = "images/missed.png";
const fhs_chest_icon_url = "images/chest.png";
const fhs_swords_icon_url = "images/swords.png";
const fhs_fox_icon_url = "images/fox.png";
const fhs_erase_icon_url = "images/erase.png";
const fhs_prediction_icon_url = "images/prediction.png";
const fhs_verified_icon_url = "images/verified.png";
const fhs_sighting_icon_url = "images/sighting.png";
const fhs_blank_icon_uri =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=";

const fhs_blocked_color = "rgb(92, 106, 130)";
const fhs_missed_color = "rgb(214, 64, 88)";
const fhs_chest_color = "rgb(217, 186, 84)";
const fhs_swords_color = "rgb(76, 126, 232)";
const fhs_fox_color = "rgb(146, 108, 222)";
const fhs_empty_color = "rgb(234, 241, 249)";
// Suggestions and Fox spots keep the unflipped tile colour; CSS draws their rings.
const fhs_prediction_color = fhs_empty_color;
const fhs_verified_color = fhs_empty_color;
const fhs_sighting_color = fhs_empty_color;

const fhs_blocked_name = "Blocked";
const fhs_missed_name = "Missed";
const fhs_chest_name = "Coffer";
const fhs_swords_name = "Swords";
const fhs_fox_name = "Fox";
const fhs_empty_name = "Empty";
const fhs_prediction_name = "Suggested flip";
const fhs_verified_name = "Possible Fox spot";
const fhs_sighting_name = "Reported Fox sighting";

const fhs_blocked_state = "1";
const fhs_missed_state = "2";
const fhs_chest_state = "3";
const fhs_swords_state = "4";
const fhs_fox_state = "5";
const fhs_empty_state = "0";
const fhs_prediction_state = "6";
const fhs_verified_state = "7";
const fhs_sighting_state = "8";
const fhs_prediction_verified_state = "9";
const fhs_prediction_sighting_state = "10";
const fhs_fox_chance_default = 50;

function IndexFormat(index) {
	var str = "0" + index;
	return str.substr(str.length - 2);
}

function isFlipState(state) {
	return (
		state === fhs_missed_state || state === fhs_chest_state || state === fhs_swords_state || state === fhs_fox_state
	);
}

function canBePredictionTarget(state) {
	return (
		state === fhs_empty_state ||
		state === fhs_verified_state ||
		state === fhs_sighting_state ||
		state === fhs_prediction_state ||
		state === fhs_prediction_verified_state ||
		state === fhs_prediction_sighting_state
	);
}

const CELL_META = {
	[fhs_empty_state]: {
		name: function () {
			return fhs_empty_name;
		},
		color: fhs_empty_color,
		icon: function () {
			return fhs_blank_icon_uri;
		}
	},
	[fhs_blocked_state]: {
		name: function () {
			return fhs_blocked_name;
		},
		color: fhs_blocked_color,
		icon: function () {
			return fhs_blocked_icon_url;
		}
	},
	[fhs_missed_state]: {
		name: function () {
			return fhs_missed_name;
		},
		color: fhs_missed_color,
		icon: function () {
			return fhs_missed_icon_url;
		}
	},
	[fhs_chest_state]: {
		name: function () {
			return fhs_chest_name;
		},
		color: fhs_chest_color,
		icon: function () {
			return fhs_chest_icon_url;
		}
	},
	[fhs_swords_state]: {
		name: function () {
			return fhs_swords_name;
		},
		color: fhs_swords_color,
		icon: function () {
			return fhs_swords_icon_url;
		}
	},
	[fhs_fox_state]: {
		name: function () {
			return fhs_fox_name;
		},
		color: fhs_fox_color,
		icon: function () {
			return fhs_fox_icon_url;
		}
	},
	[fhs_prediction_state]: {
		name: function () {
			return fhs_prediction_name;
		},
		color: fhs_prediction_color,
		icon: function () {
			return fhs_prediction_icon_url;
		}
	},
	[fhs_verified_state]: {
		name: function () {
			return fhs_verified_name;
		},
		color: fhs_verified_color,
		icon: function () {
			return fhs_verified_icon_url;
		}
	},
	[fhs_sighting_state]: {
		name: function () {
			return fhs_sighting_name;
		},
		color: fhs_sighting_color,
		icon: function () {
			return fhs_sighting_icon_url;
		}
	},
	[fhs_prediction_verified_state]: {
		name: function () {
			return fhs_prediction_name + " and " + fhs_verified_name;
		},
		color: fhs_verified_color,
		icon: function () {
			return fhs_prediction_icon_url;
		}
	},
	[fhs_prediction_sighting_state]: {
		name: function () {
			return fhs_prediction_name + " and " + fhs_sighting_name;
		},
		color: fhs_sighting_color,
		icon: function () {
			return fhs_prediction_icon_url;
		}
	}
};

const fhs_sheet_patterns = [
	[8, 10, 13, 26, 35],
	[9, 13, 16, 28, 30],
	[0, 9, 22, 25, 27],
	[5, 7, 19, 22, 26],
	[3, 13, 16, 21, 32],
	[9, 12, 20, 23, 27],
	[3, 14, 19, 22, 32],
	[8, 12, 15, 23, 26],
	[4, 7, 15, 25, 33],
	[7, 10, 18, 21, 29],
	[2, 10, 20, 28, 31],
	[6, 14, 17, 25, 28],
	[7, 16, 18, 27, 32],
	[2, 10, 12, 19, 27],
	[3, 8, 17, 19, 28],
	[8, 16, 23, 25, 33]
];

document.addEventListener("keydown", function (event) {
	var isEditingWeights = false;
	var weights = document.querySelectorAll("input[type=number]");
	var selection = document.activeElement;
	Array.prototype.forEach.call(weights, function (weight) {
		if (weight == selection) {
			isEditingWeights = true;
		}
	});
	if (!isEditingWeights) {
		var index = -1;
		switch (event.key) {
			case "1":
				index = 0;
				break;
			case "2":
				index = 1;
				break;
			case "3":
				index = 2;
				break;
			case "4":
				index = 3;
				break;
			case "5":
				index = 4;
				break;
			case "6":
				index = 5;
				break;
			default:
				break;
		}
		if (index >= 0) {
			document.getElementsByName("pickeritem")[index].checked = true;
		}
	}
});

/*

	Settings persistence (localStorage)

*/

document.getElementById("advancedsettings").addEventListener("change", function () {
	SaveSettings();
});

document.addEventListener("DOMContentLoaded", function () {
	RestoreSettings();
});

function SaveSettings() {
	const collapse = document.getElementById("collapsebox");
	const settings = {
		spreadsheet: document.getElementById("spreadsheet").checked,
		lookforfox: document.getElementById("lookforfox").checked,
		showstats: document.getElementById("showstats").checked,
		liveupdate: document.getElementById("liveupdate").checked,
		gameweek2: document.getElementById("gameweek2").checked,
		foxchance: String(normalizeWeightInput("foxchance", fhs_fox_chance_default)),
		advancedOpen: !!(collapse && collapse.style.maxHeight)
	};
	localStorage.setItem("settings", JSON.stringify(settings));
}

function RestoreSettings() {
	const raw = localStorage.getItem("settings");
	if (raw == null) {
		LiveUpdate();
		return;
	}

	var settingsObject;
	try {
		settingsObject = JSON.parse(raw);
	} catch (e) {
		LiveUpdate();
		return;
	}

	if (typeof settingsObject.spreadsheet === "boolean") {
		document.getElementById("spreadsheet").checked = settingsObject.spreadsheet;
	}
	if (typeof settingsObject.lookforfox === "boolean") {
		document.getElementById("lookforfox").checked = settingsObject.lookforfox;
	}
	if (typeof settingsObject.showstats === "boolean") {
		document.getElementById("showstats").checked = settingsObject.showstats;
	}
	if (typeof settingsObject.liveupdate === "boolean") {
		document.getElementById("liveupdate").checked = settingsObject.liveupdate;
	}

	document.getElementById("gameweek2").checked = !!settingsObject.gameweek2;
	document.getElementById("gameweek1").checked = !settingsObject.gameweek2;

	if (settingsObject.foxchance != null) {
		document.getElementById("foxchance").value = settingsObject.foxchance;
	}

	// The retelling sets the Fox, coffer and sword values.
	applyGameWeekPreset();

	if (settingsObject.advancedOpen) {
		var collapse = document.getElementById("collapsebox");
		var arrow = document.getElementById("arrow");
		if (collapse && !collapse.style.maxHeight) {
			collapse.style.maxHeight = collapse.scrollHeight + "px";
			if (arrow) arrow.classList.add("arrow-rotated");
		}
	}
	// applyGameWeekPreset() saves before the pane is restored; persist the final
	// restored layout state as well.
	SaveSettings();
	updateControlsSticky();
}

/*

	Begin Collapse and Reset Listeners

*/

document.getElementById("menucollapse").addEventListener("click", function () {
	var arrow = document.getElementById("arrow");
	arrow.classList.toggle("arrow-rotated");
	var collapse = document.getElementById("collapsebox");
	if (collapse.style.maxHeight) {
		collapse.style.maxHeight = null;
	} else {
		collapse.style.maxHeight = collapse.scrollHeight + "px";
	}
	updateControlsSticky();
	SaveSettings();
});
var collapselabel = document.getElementById("collapselabel");
collapselabel.addEventListener("mousedown", function () {
	var cbutton = document.getElementById("collapselabel");
	if (!cbutton.classList.contains("advanced-collapse-pressed")) {
		cbutton.classList.add("advanced-collapse-pressed");
	}
});
function removeCollapsePressed() {
	var cbutton = document.getElementById("collapselabel");
	if (cbutton.classList.contains("advanced-collapse-pressed")) {
		cbutton.classList.remove("advanced-collapse-pressed");
	}
}
collapselabel.addEventListener("mouseup", removeCollapsePressed);
collapselabel.addEventListener("mouseleave", removeCollapsePressed);

document.getElementById("resetbutton").addEventListener("click", function () {
	ResetBoard();
});
var resetlabel = document.getElementById("resetbuttonlabel");
resetlabel.addEventListener("mousedown", function () {
	var rbutton = document.getElementById("resetbuttonlabel");
	if (!rbutton.classList.contains("reset-button-pressed")) {
		rbutton.classList.add("reset-button-pressed");
	}
});
function removeResetPressed() {
	var rbutton = document.getElementById("resetbuttonlabel");
	if (rbutton.classList.contains("reset-button-pressed")) {
		rbutton.classList.remove("reset-button-pressed");
	}
}
resetlabel.addEventListener("mouseup", removeResetPressed);
resetlabel.addEventListener("mouseleave", removeResetPressed);

/*

	End Collapse and Reset Listeners

*/

/*

	Board construction + other listeners

*/

function buildBoard() {
	var board = document.getElementById("board");
	if (!board || board.children.length) {
		return;
	}
	var frag = document.createDocumentFragment();
	for (var i = 0; i < 36; i++) {
		var id = IndexFormat(i);
		var cell = document.createElement("div");
		cell.id = "cell" + id;
		cell.className = "board-cell optransition noselect";
		cell.setAttribute("data-index", id);
		cell.setAttribute("data-state", fhs_empty_state);
		cell.setAttribute("title", fhs_empty_name);
		cell.setAttribute("tabindex", "0");
		cell.setAttribute("role", "button");
		cell.setAttribute("aria-label", "Row " + (Math.floor(i / 6) + 1) + ", column " + ((i % 6) + 1) + ", Empty");
		cell.innerHTML =
			'<img src="' +
			fhs_blank_icon_uri +
			'" alt="" class="board-cell-icon" draggable="false">' +
			'<span class="board-cell-text"></span>';
		frag.appendChild(cell);
	}
	board.appendChild(frag);
}

function bindLongPressErase(cell) {
	var pressTimer = null;
	var startX = 0;
	var startY = 0;
	var moved = false;

	function clearPress() {
		if (pressTimer) {
			clearTimeout(pressTimer);
			pressTimer = null;
		}
	}

	cell.addEventListener("pointerdown", function (e) {
		if (e.pointerType === "mouse" && e.button !== 0) return;
		moved = false;
		startX = e.clientX;
		startY = e.clientY;
		clearPress();
		pressTimer = setTimeout(function () {
			pressTimer = null;
			if (moved) return;
			if (cell.getAttribute("data-state") === fhs_empty_state) return;
			fhs_suppress_click = true;
			applyCellMark(cell, "clear", true);
		}, 450);
	});
	cell.addEventListener("pointermove", function (e) {
		if (!pressTimer) return;
		if (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10) {
			moved = true;
			clearPress();
		}
	});
	cell.addEventListener("pointerup", clearPress);
	cell.addEventListener("pointercancel", clearPress);
	cell.addEventListener("pointerleave", clearPress);
}

buildBoard();

var cells = document.getElementsByClassName("board-cell");
Array.prototype.forEach.call(cells, function (cell) {
	cell.addEventListener("click", CellClick);
	cell.addEventListener("keydown", function (e) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			CellClick.call(cell);
		}
	});
	bindLongPressErase(cell);
});

var lookForFoxCheck = document.getElementById("lookforfox");
lookForFoxCheck.addEventListener("click", LiveUpdate);

var spreadsheet = document.getElementById("spreadsheet");
spreadsheet.addEventListener("click", function () {
	ClearSightings();
	UpdateSightings();
	SaveSettings();
});

var weightFeilds = document.querySelectorAll("input[type=number]");
Array.prototype.forEach.call(weightFeilds, function (weight) {
	weight.addEventListener("change", function () {
		LiveUpdate();
		SaveSettings();
	});
});

var gameWeekRadios = document.querySelectorAll("input[type=radio][name=gameweek]");
Array.prototype.forEach.call(gameWeekRadios, function (radio) {
	radio.addEventListener("change", applyGameWeekPreset);
});

var showstatsEl = document.getElementById("showstats");
if (showstatsEl) {
	showstatsEl.addEventListener("change", function () {
		ScoresCheckUpdate();
		SaveSettings();
	});
}
var liveupdateEl = document.getElementById("liveupdate");
if (liveupdateEl) {
	liveupdateEl.addEventListener("change", function () {
		LiveUpdate();
		ScoresCheckUpdate();
		SaveSettings();
	});
}

document.getElementById("undobutton").addEventListener("click", UndoLast);

var siteHeader = document.getElementById("site-header");
var contentPane = document.getElementById("content");
var fhs_shrink_band = 20; // must exceed 2x the header's expand/shrink height delta, or the toggle can flicker.

// Measured against the header's expanded bottom edge (not its current, possibly-shrunk
// one) so shrinking the header can't move the trigger point and feed back into itself.
var fhs_header_expanded_bottom = 0;
function computeHeaderExpandedBottom() {
	var wasShrink = siteHeader.classList.contains("shrink");
	if (wasShrink) siteHeader.classList.remove("shrink");
	var top = parseFloat(getComputedStyle(siteHeader).top) || 0;
	fhs_header_expanded_bottom = top + siteHeader.offsetHeight;
	if (wasShrink) siteHeader.classList.add("shrink");
}
computeHeaderExpandedBottom();
window.addEventListener("resize", computeHeaderExpandedBottom);
if (document.fonts && document.fonts.ready) {
	document.fonts.ready.then(computeHeaderExpandedBottom);
}

function scheduleFrame(callback) {
	if (window.requestAnimationFrame) {
		return window.requestAnimationFrame(callback);
	}
	return window.setTimeout(callback, 0);
}

var fhs_header_scroll_frame = null;
function updateHeaderOnScroll() {
	var shrink = siteHeader.classList.contains("shrink");
	var contentTop = contentPane.getBoundingClientRect().top;
	var shouldShrink =
		contentTop <= fhs_header_expanded_bottom
			? true
			: contentTop > fhs_header_expanded_bottom + fhs_shrink_band
				? false
				: shrink;
	if (shouldShrink !== shrink) {
		siteHeader.classList.toggle("shrink", shouldShrink);
	}
}
window.addEventListener(
	"scroll",
	function () {
		if (fhs_header_scroll_frame !== null) return;
		fhs_header_scroll_frame = scheduleFrame(function () {
			fhs_header_scroll_frame = null;
			updateHeaderOnScroll();
		});
	},
	{ passive: true }
);

// Bottom-sticky controls are useful only when the full panel fits below the board
// at rest.  Otherwise leaving the panel in normal flow is safer than allowing a
// tall sticky element to cover the board on short or mobile viewports.
var controlsBarEl = document.querySelector(".controls-sticky");
var controlsStickyMedia = window.matchMedia
	? window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)")
	: null;
function updateControlsSticky() {
	if (!controlsBarEl) return;
	controlsBarEl.classList.remove("controls-sticky-active");
	if (!controlsStickyMedia || !controlsStickyMedia.matches) return;
	var normalBottom = controlsBarEl.getBoundingClientRect().bottom;
	controlsBarEl.classList.toggle("controls-sticky-active", normalBottom <= window.innerHeight);
}
updateControlsSticky();
window.addEventListener("resize", updateControlsSticky);
if (controlsStickyMedia) {
	if (controlsStickyMedia.addEventListener) {
		controlsStickyMedia.addEventListener("change", updateControlsSticky);
	} else if (controlsStickyMedia.addListener) {
		controlsStickyMedia.addListener(updateControlsSticky);
	}
}
if (controlsBarEl && window.ResizeObserver) {
	new ResizeObserver(updateControlsSticky).observe(controlsBarEl);
}
if (document.fonts && document.fonts.ready) {
	document.fonts.ready.then(updateControlsSticky);
}

/*

	End Listeners

*/

window.fhs_undo = [];
const fhs_undo_max = 20;
var fhs_suppress_click = false;

function pickerItemToState(pickedItem) {
	switch (pickedItem) {
		case "blocked":
			return fhs_blocked_state;
		case "missed":
			return fhs_missed_state;
		case "chest":
			return fhs_chest_state;
		case "swords":
			return fhs_swords_state;
		case "fox":
			return fhs_fox_state;
		case "clear":
			return fhs_empty_state;
		default:
			return null;
	}
}

function pushUndo(cellId, prevState, flipDelta, prevSolverFilled) {
	window.fhs_undo.push({
		id: cellId,
		prevState: prevState,
		flipDelta: flipDelta,
		prevSolverFilled: prevSolverFilled
	});
	if (window.fhs_undo.length > fhs_undo_max) {
		window.fhs_undo.shift();
	}
}

function applyCellMark(cell, pickedItem, fromLongPress) {
	var prevState = cell.getAttribute("data-state");
	var prevSolverFilled = cell.getAttribute("data-solver-filled") === "true";
	var newState = pickerItemToState(pickedItem);
	if (newState == null) {
		console.error("Radio button value invalid.");
		return;
	}
	if (prevState === newState) {
		// A solver-filled piece is a deduction until the player confirms the flip.
		if (prevSolverFilled && isFlipState(prevState)) {
			pushUndo(cell.id, prevState, 1, true);
			cell.removeAttribute("data-solver-filled");
			window.fhs_flips_used += 1;
			UpdateFlipCounter();
			UpdateCell(cell);
			LiveUpdate();
		}
		return;
	}

	var wasFlip = isFlipState(prevState) && !prevSolverFilled;
	var isFlip = isFlipState(newState);
	var flipDelta = 0;
	if (!wasFlip && isFlip) {
		flipDelta = 1;
	} else if (wasFlip && !isFlip) {
		flipDelta = -1;
	}

	pushUndo(cell.id, prevState, flipDelta, prevSolverFilled);
	cell.setAttribute("data-state", newState);
	cell.removeAttribute("data-solver-filled");
	if (flipDelta !== 0) {
		window.fhs_flips_used = Math.max(0, window.fhs_flips_used + flipDelta);
		UpdateFlipCounter();
	}
	UpdateCell(cell);
	LiveUpdate();
}

function CellClick() {
	if (fhs_suppress_click) {
		fhs_suppress_click = false;
		return;
	}
	applyCellMark(this, getPickerMenuItem(), false);
}

function UndoLast() {
	var entry = window.fhs_undo.pop();
	if (!entry) return;
	var cell = document.getElementById(entry.id);
	if (!cell) return;
	cell.setAttribute("data-state", entry.prevState);
	if (entry.prevSolverFilled) {
		cell.setAttribute("data-solver-filled", "true");
	} else {
		cell.removeAttribute("data-solver-filled");
	}
	window.fhs_flips_used = Math.max(0, window.fhs_flips_used - entry.flipDelta);
	UpdateFlipCounter();
	UpdateCell(cell);
	LiveUpdate();
}

document.addEventListener("keydown", function (event) {
	var isEditingWeights = document.activeElement && document.activeElement.type === "number";
	if (isEditingWeights) return;
	if ((event.ctrlKey || event.metaKey) && (event.key === "z" || event.key === "Z")) {
		event.preventDefault();
		UndoLast();
	}
});

const fhs_flip_budget = 11;

function UpdateFlipCounter() {
	var counter = document.getElementById("flipcounter");
	counter.textContent = "Flips: " + window.fhs_flips_used + " / " + fhs_flip_budget;
	counter.classList.toggle("flip-counter-exhausted", window.fhs_flips_used >= fhs_flip_budget);
}

// Called on MouseEnter and MouseLeave events for each board cell.
function cellOpacity() {
	if (this.style.opacity < 1) {
		this.style.opacity = 1;
	} else {
		this.style.opacity = 0.9;
	}
}

// Called on MouseEnter and MouseLeave events for the picker radio buttons.
function radioOpacity() {
	if (this.style.opacity < 1) {
		this.style.opacity = 1;
	} else {
		this.style.opacity = 0.8;
	}
}

function getPickerMenuItem() {
	return document.querySelector("input[name='pickeritem']:checked").value;
}

function updateTitles() {
	var cells = document.getElementsByClassName("board-cell");
	Array.prototype.forEach.call(cells, function (cell) {
		switch (cell.getAttribute("data-state")) {
			case fhs_empty_state:
				cell.setAttribute("title", fhs_empty_name);
				break;
			case fhs_blocked_state:
				cell.setAttribute("title", fhs_blocked_name);
				break;
			case fhs_missed_state:
				cell.setAttribute("title", fhs_missed_name);
				break;
			case fhs_chest_state:
				cell.setAttribute("title", fhs_chest_name);
				break;
			case fhs_swords_state:
				cell.setAttribute("title", fhs_swords_name);
				break;
			case fhs_fox_state:
				cell.setAttribute("title", fhs_fox_name);
				break;
			case fhs_prediction_state:
				cell.setAttribute("title", fhs_prediction_name);
				break;
			case fhs_verified_state:
				cell.setAttribute("title", fhs_verified_name);
				break;
			case fhs_sighting_state:
				cell.setAttribute("title", fhs_sighting_name);
				break;
			case fhs_prediction_verified_state:
				cell.setAttribute("title", fhs_prediction_name + " and " + fhs_verified_name);
				break;
			case fhs_prediction_sighting_state:
				cell.setAttribute("title", fhs_prediction_name + " and " + fhs_sighting_name);
				break;
			default:
				break;
		}
	});
}

// First Retelling: finishing the swords unlocks the second game, so swords and coffer come
// first. Second Retelling: one swords cell is enough, then the coffer and Fox matter.
const fhs_game_presets = {
	game1: { fox: 10, coffer: 70, swords: 100, swordsNeed: 6 },
	game2: { fox: 50, coffer: 50, swords: 60, swordsNeed: 1 }
};

function currentPreset() {
	return document.getElementById("gameweek2").checked ? fhs_game_presets.game2 : fhs_game_presets.game1;
}

function applyGameWeekPreset() {
	var preset = currentPreset();
	document.getElementById("foxweight").value = preset.fox;
	document.getElementById("coffervalue").value = preset.coffer;
	document.getElementById("swordweight").value = preset.swords;
	SaveSettings();
	LiveUpdate();
}

function doFoxSightings() {
	return document.getElementById("spreadsheet").checked;
}

function doLiveUpdate() {
	return document.getElementById("liveupdate").checked;
}

var fhs_live_update_frame = null;
function LiveUpdate() {
	if (!doLiveUpdate() || fhs_live_update_frame !== null) return;
	fhs_live_update_frame = scheduleFrame(function () {
		fhs_live_update_frame = null;
		if (doLiveUpdate()) runGuaranteed();
	});
}

function UpdateCell(cell) {
	var state_value = cell.getAttribute("data-state");
	var meta = CELL_META[state_value];
	var childImage = cell.querySelector("img");
	if (!meta || !childImage) {
		console.error("Invalid cell state.");
		return;
	}
	var name = meta.name();
	cell.style.backgroundColor = meta.color;
	childImage.setAttribute("src", meta.icon());
	cell.setAttribute("title", name);
	var idx = parseInt(cell.getAttribute("data-index"), 10);
	if (!isNaN(idx)) {
		var row = Math.floor(idx / 6) + 1;
		var col = (idx % 6) + 1;
		cell.setAttribute("aria-label", "Row " + row + ", column " + col + ", " + name);
	}
}

function UpdateGrid() {
	var cells = document.getElementsByClassName("board-cell");
	Array.prototype.forEach.call(cells, function (cell) {
		UpdateCell(cell);
	});
}

function ScoresCheckUpdate() {
	if (QueryShowScores()) {
		UpdateScoresInCells();
	} else {
		ClearAllCellText();
	}
}

function UpdateScoresInCells() {
	if (!QueryShowScores()) {
		return;
	}
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			var numStr = IndexFormat(j + 6 * i);
			var cell = document.getElementById("cell" + numStr);
			var state = cell.getAttribute("data-state");
			var span = cell.querySelector("span");
			var next = "";
			if (
				canBePredictionTarget(state) ||
				state == fhs_prediction_state ||
				state == fhs_prediction_verified_state ||
				state == fhs_prediction_sighting_state ||
				state == fhs_empty_state ||
				state == fhs_verified_state ||
				state == fhs_sighting_state
			) {
				var v = window.fhs_grid_scores[i][j];
				if (Number.isFinite(v)) {
					next = Math.round(v * 100) + "%";
				}
			}
			if (span.textContent !== next) {
				span.textContent = next;
			}
		}
	}
}

function ClearAllCellText() {
	var cells = document.getElementsByClassName("board-cell");
	Array.prototype.forEach.call(cells, function (cell) {
		var span = cell.querySelector("span");
		if (span) span.textContent = "";
	});
}

function ClearPredictionsAndSightings() {
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			var numStr = IndexFormat(j + 6 * i);
			var cell = document.getElementById("cell" + numStr);
			var state = cell.getAttribute("data-state");
			if (
				state == fhs_prediction_state ||
				state == fhs_verified_state ||
				state == fhs_sighting_state ||
				state == fhs_prediction_sighting_state ||
				state == fhs_prediction_verified_state
			) {
				cell.setAttribute("data-state", fhs_empty_state);
				UpdateCell(cell);
			}
		}
	}
}

function ClearSightings() {
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			var numStr = IndexFormat(j + 6 * i);
			var cell = document.getElementById("cell" + numStr);
			var state = cell.getAttribute("data-state");
			if (state == fhs_verified_state || state == fhs_sighting_state) {
				cell.setAttribute("data-state", fhs_empty_state);
				UpdateCell(cell);
			} else if (state == fhs_prediction_sighting_state) {
				cell.setAttribute("data-state", fhs_prediction_state);
				UpdateCell(cell);
			} else if (state == fhs_prediction_verified_state) {
				cell.setAttribute("data-state", fhs_prediction_state);
				UpdateCell(cell);
			}
		}
	}
}

function QueryShowScores() {
	return document.getElementById("showstats").checked;
}

function ResetBoard() {
	var cells = document.getElementsByClassName("board-cell");
	Array.prototype.forEach.call(cells, function (cell) {
		cell.setAttribute("data-state", fhs_empty_state);
		cell.removeAttribute("data-solver-filled");
		UpdateCell(cell);
	});
	window.fhs_grid = PrefillArray();
	window.fhs_grid_scores = PrefillArray();
	UpdateScoresInCells();
	window.fhs_flips_used = 0;
	window.fhs_undo = [];
	UpdateFlipCounter();
	fhs_plan_request++;
	Array.prototype.forEach.call(cells, function (cell) {
		cell.style.removeProperty("--heat");
		cell.classList.remove("cell-flip-now", "cell-out-of-reach");
	});
	RenderStatus("Mark the 5 blocked tiles to start.", [], false);
}

/*

	Calculation functions and globals

*/

/*
	GLOBALS
*/
window.fhs_grid = PrefillArray();
window.fhs_grid_scores = PrefillArray();
window.fhs_flips_used = 0;
if (!window.fhs_undo) window.fhs_undo = [];

/*
	FUNCTIONS
*/
function PrefillArray() {
	return new Array(6).fill(0).map(() => new Array(6).fill(0));
}

function ClearSolverFilledCells() {
	var cells = document.getElementsByClassName("board-cell");
	Array.prototype.forEach.call(cells, function (cell) {
		if (cell.getAttribute("data-solver-filled") === "true") {
			cell.setAttribute("data-state", fhs_empty_state);
			cell.removeAttribute("data-solver-filled");
			UpdateCell(cell);
		}
	});
}

function ParseGrid() {
	window.fhs_grid = PrefillArray();
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			var numStr = IndexFormat(j + 6 * i);
			var cell = document.getElementById("cell" + numStr);
			var state = cell.getAttribute("data-state");

			if (state == fhs_blocked_state) {
				window.fhs_grid[i][j] = 1;
			} else if (state == fhs_missed_state) {
				window.fhs_grid[i][j] = 2;
			} else if (state == fhs_chest_state) {
				window.fhs_grid[i][j] = 3;
			} else if (state == fhs_swords_state) {
				window.fhs_grid[i][j] = 4;
			} else if (state == fhs_fox_state) {
				window.fhs_grid[i][j] = 5;
			} else {
				// Empty, Verified, Sighting, and Prediction states
				window.fhs_grid[i][j] = 0;
			}
		}
	}
}

function UpdateSightings() {
	if (!doFoxSightings()) {
		return;
	}

	var type = IdentifyPattern();

	if (type != -1) {
		var verifiedGrid = PrefillArray();
		var sightingGrid = PrefillArray();
		fhs_sheet_fox[type].forEach((board) => {
			var match = true;
			outerloop: for (var i = 0; i < 6; i++) {
				for (var j = 0; j < 6; j++) {
					if (window.fhs_grid[i][j] == 2) {
						if (board[i][j] != 0 && board[i][j] != 4 && board[i][j] != 5) {
							match = false;
							break outerloop;
						}
					} else if (window.fhs_grid[i][j] == 3) {
						if (board[i][j] != 2) {
							match = false;
							break outerloop;
						}
					} else if (window.fhs_grid[i][j] == 4) {
						if (board[i][j] != 3) {
							match = false;
							break outerloop;
						}
					} else if (window.fhs_grid[i][j] == 5) {
						// Fox already in grid, no need for any further processing
						return;
					}
				}
			}
			if (match) {
				for (var i = 0; i < 6; i++) {
					for (var j = 0; j < 6; j++) {
						if (board[i][j] == 4) {
							verifiedGrid[i][j]++;
						} else if (board[i][j] == 5) {
							sightingGrid[i][j]++;
						}
					}
				}
			}
		});
		for (var i = 0; i < 6; i++) {
			for (var j = 0; j < 6; j++) {
				var updated = false;
				var numStr = IndexFormat(j + 6 * i);
				var cell = document.getElementById("cell" + numStr);
				var state = cell.getAttribute("data-state");
				if (state == fhs_verified_state) {
					cell.setAttribute("data-state", fhs_empty_state);
					state = fhs_empty_state;
					updated = true;
				}
				if (state == fhs_sighting_state) {
					cell.setAttribute("data-state", fhs_empty_state);
					state = fhs_empty_state;
					updated = true;
				}
				if (sightingGrid[i][j] > 0 && state != fhs_missed_state) {
					if (state == fhs_prediction_state || state == fhs_prediction_sighting_state) {
						cell.setAttribute("data-state", fhs_prediction_sighting_state);
					} else {
						cell.setAttribute("data-state", fhs_sighting_state);
					}
					updated = true;
				}
				if (verifiedGrid[i][j] > 0 && state != fhs_missed_state) {
					if (state == fhs_prediction_state || state == fhs_prediction_verified_state) {
						cell.setAttribute("data-state", fhs_prediction_verified_state);
					} else {
						cell.setAttribute("data-state", fhs_verified_state);
					}
					updated = true;
				}
				if (updated) {
					UpdateCell(cell);
				}
			}
		}
	}
}

function IdentifyPattern() {
	var positions = [];
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (fhs_grid[i][j] == 1) {
				if (positions.length >= 5) {
					return -1;
				}
				positions.push(i * 6 + j);
			}
		}
	}
	if (positions.length !== 5) {
		return -1;
	}
	var exists = fhs_sheet_patterns.some((row) => JSON.stringify(row) === JSON.stringify(positions));
	if (exists) {
		var match = true;
		for (var i = 0; i < fhs_sheet_patterns.length; i++) {
			innerloop: for (var j = 0; j < 5; j++) {
				if (positions[j] == fhs_sheet_patterns[i][j]) {
					match = true;
				} else {
					match = false;
					break innerloop;
				}
			}
			if (match) {
				return i;
			}
		}
	}
	return -1;
}

function MarkGuaranteedBlocks() {
	var medMap = NaiiveMedProb();
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (medMap[i][j] == 1 && window.fhs_grid[i][j] != 3) {
				window.fhs_grid[i][j] = 3;
				var numStr = IndexFormat(j + 6 * i);
				var cell = document.getElementById("cell" + numStr);
				cell.setAttribute("data-state", fhs_chest_state);
				cell.setAttribute("data-solver-filled", "true");
				UpdateCell(cell);
			}
		}
	}

	// Large
	var largeMap = NaiiveLargeProb();
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (largeMap[i][j] == 1 && window.fhs_grid[i][j] != 4) {
				window.fhs_grid[i][j] = 4;
				var numStr = IndexFormat(j + 6 * i);
				var cell = document.getElementById("cell" + numStr);
				cell.setAttribute("data-state", fhs_swords_state);
				cell.setAttribute("data-solver-filled", "true");
				UpdateCell(cell);
			}
		}
	}
}

function runGuaranteed() {
	ClearSolverFilledCells();
	ParseGrid();

	for (var i = 0; i < 2; i++) {
		MarkGuaranteedBlocks();
	}

	var analysis = AnalyzeBoard();
	MarkCertainCells(analysis);
	window.fhs_analysis = analysis;
	window.fhs_grid_scores = ChanceGrid(analysis);
	UpdateScoresInCells();
	ClearPredictionsAndSightings();
	UpdateSightings();

	var move = FhsGreedyMove(
		analysis.probs,
		analysis.obs,
		analysis.counts,
		analysis.r,
		analysis.values,
		analysis.needs
	);
	analysis.planning = analysis.mode === "sheet" && analysis.r > 0 && analysis.blocked.length > 0;
	ShowMove(analysis, move);
	if (analysis.planning) RequestPlan(analysis);
}

var fhs_piece_names = { 5: "Fox", 3: "coffer", 4: "swords" };

function cellAt(k) {
	return document.getElementById("cell" + IndexFormat(k));
}

function isSolverFilled(cell) {
	return cell.getAttribute("data-solver-filled") === "true";
}

var fhs_sheet_world_cache = {};
function SheetWorldsFor(pattern, foxChance) {
	var key = pattern + "@" + foxChance;
	if (!fhs_sheet_world_cache[key]) {
		fhs_sheet_world_cache[key] = FhsSheetWorlds(fhs_sheet_fox[pattern], foxChance);
	}
	return fhs_sheet_world_cache[key];
}

function GetFoxChance() {
	return normalizeWeightInput("foxchance", fhs_fox_chance_default) / 100;
}

function GeometricProbabilities(lookingForFox) {
	if (lookingForFox) {
		var full = CalculateFullProb();
		return { 5: full[0].flat(), 3: full[1].flat(), 4: full[2].flat() };
	}
	var noFox = CalculateProbWithoutFox();
	return { 5: new Array(36).fill(0), 3: noFox[0].flat(), 4: noFox[1].flat() };
}

// Board as the solver sees it: only flips the player has confirmed count as observations.
function AnalyzeBoard() {
	var obs = new Array(36).fill(-1);
	var counts = [0, 0, 0];
	var blocked = [];
	for (var k = 0; k < 36; k++) {
		var cell = cellAt(k);
		var state = cell.getAttribute("data-state");
		if (state === fhs_blocked_state) {
			obs[k] = 1;
			blocked.push(k);
		} else if (isFlipState(state) && !isSolverFilled(cell)) {
			obs[k] = Number(state);
			var pi = FHS_PIECES.indexOf(obs[k]);
			if (pi >= 0) counts[pi]++;
		}
	}

	var lookingForFox = document.getElementById("lookforfox").checked;
	var values = {
		5: lookingForFox ? GetFoxWeight() : 0,
		3: normalizeWeightInput("coffervalue", currentPreset().coffer),
		4: normalizeWeightInput("swordweight", currentPreset().swords)
	};
	var needs = { 5: 1, 3: FHS_PIECE_SIZE[3], 4: currentPreset().swordsNeed };
	var pattern = doFoxSightings() ? FhsIdentifyPatternFromBlocked(blocked, fhs_sheet_patterns) : -1;
	var foxChance = GetFoxChance();
	var sheet = pattern >= 0 ? SheetWorldsFor(pattern, foxChance) : null;
	var W = sheet ? FhsConsistentWorlds(sheet.worlds, obs) : [];

	var mode;
	if (W.length) mode = "sheet";
	else if (!doFoxSightings()) mode = "sheet-off";
	else if (blocked.length < 5) mode = "need-blocked";
	else mode = "off-sheet";

	var probs = mode === "sheet" ? FhsWorldProbabilities(sheet, W) : GeometricProbabilities(lookingForFox);
	var foxFound = counts[0] > 0;
	return {
		obs: obs,
		counts: counts,
		blocked: blocked,
		values: values,
		needs: needs,
		r: Math.max(0, GetFlipsRemaining()),
		lookingForFox: lookingForFox,
		foxChance: foxChance,
		foxPresent: mode === "sheet" ? (foxFound ? 1 : probs.foxPresent) : null,
		pattern: pattern,
		sheet: sheet,
		W: W,
		mode: mode,
		probs: probs
	};
}

// Fill in cells every remaining layout agrees on, so they show as certain-but-unflipped.
function MarkCertainCells(analysis) {
	var stateFor = { 3: fhs_chest_state, 4: fhs_swords_state, 5: fhs_fox_state };
	for (var k = 0; k < 36; k++) {
		if (analysis.obs[k] !== -1) continue;
		var cell = cellAt(k);
		if (isFlipState(cell.getAttribute("data-state"))) continue;
		FHS_PIECES.forEach(function (p) {
			if (analysis.probs[p][k] < 1 - 1e-9) return;
			window.fhs_grid[Math.floor(k / 6)][k % 6] = p;
			cell.setAttribute("data-state", stateFor[p]);
			cell.setAttribute("data-solver-filled", "true");
			UpdateCell(cell);
		});
	}
}

function pieceChance(analysis, k) {
	var chance = analysis.probs[3][k] + analysis.probs[4][k];
	if (analysis.lookingForFox) chance += analysis.probs[5][k];
	return Math.min(1, chance);
}

function ChanceGrid(analysis) {
	var grid = PrefillArray();
	for (var k = 0; k < 36; k++) {
		grid[Math.floor(k / 6)][k % 6] = analysis.obs[k] === -1 ? pieceChance(analysis, k) : NaN;
	}
	return grid;
}

function piecesInPlay(analysis) {
	return FHS_PIECES.filter(function (p, pi) {
		if (p === 5 && (!analysis.lookingForFox || analysis.foxPresent === 0)) return false;
		return analysis.counts[pi] < analysis.needs[p];
	});
}

function needFor(analysis, p) {
	return Math.max(0, analysis.needs[p] - analysis.counts[FHS_PIECES.indexOf(p)]);
}

function certainCells(piece) {
	var stateFor = { 3: fhs_chest_state, 4: fhs_swords_state, 5: fhs_fox_state };
	var out = [];
	for (var k = 0; k < 36; k++) {
		var cell = cellAt(k);
		if (isSolverFilled(cell) && cell.getAttribute("data-state") === stateFor[piece]) out.push(k);
	}
	return out;
}

function ClearSuggestions() {
	var back = {};
	back[fhs_prediction_state] = fhs_empty_state;
	back[fhs_prediction_verified_state] = fhs_verified_state;
	back[fhs_prediction_sighting_state] = fhs_sighting_state;
	for (var k = 0; k < 36; k++) {
		var cell = cellAt(k);
		var state = cell.getAttribute("data-state");
		if (back[state] !== undefined) {
			cell.setAttribute("data-state", back[state]);
			UpdateCell(cell);
		}
		cell.classList.remove("cell-flip-now");
	}
}

function SuggestCell(k) {
	var cell = cellAt(k);
	var forward = {};
	forward[fhs_empty_state] = fhs_prediction_state;
	forward[fhs_verified_state] = fhs_prediction_verified_state;
	forward[fhs_sighting_state] = fhs_prediction_sighting_state;
	var next = forward[cell.getAttribute("data-state")];
	if (next !== undefined) {
		cell.setAttribute("data-state", next);
		UpdateCell(cell);
	}
}

function cellName(k) {
	return "row " + (Math.floor(k / 6) + 1) + ", column " + ((k % 6) + 1);
}

function joinWords(words) {
	if (words.length < 2) return words.join("");
	return words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
}

function chanceSummary(analysis, k) {
	var parts = [];
	[3, 4, 5].forEach(function (p) {
		if (p === 5 && !analysis.lookingForFox) return;
		var pct = Math.round(analysis.probs[p][k] * 100);
		if (pct > 0) parts.push(pct + "% " + fhs_piece_names[p]);
	});
	return parts.length ? parts.join(", ") : "no piece expected";
}

// move: { cell, ties, finish } from FhsGreedyMove or the planner.
function ShowMove(analysis, move) {
	ClearSuggestions();
	var headline;
	var notes = [];

	if (!analysis.blocked.length) {
		headline = "Mark the 5 blocked tiles to start.";
	} else if (analysis.r <= 0) {
		headline = "No flips left.";
	} else if (move.cell >= 0) {
		var cells = move.ties && move.ties.length > 1 ? move.ties : [move.cell];
		cells.forEach(SuggestCell);
		headline =
			cells.length > 1
				? "Flip any ringed cell — " + cells.length + " are equally good."
				: "Flip " + cellName(move.cell) + " — " + chanceSummary(analysis, move.cell) + ".";
	} else if (move.finish && move.finish.length) {
		var total = 0;
		move.finish.forEach(function (p) {
			certainCells(p)
				.slice(0, needFor(analysis, p))
				.forEach(function (k) {
					cellAt(k).classList.add("cell-flip-now");
					total++;
				});
		});
		headline =
			"Flip the " +
			total +
			" certain " +
			joinWords(
				move.finish.map(function (p) {
					return fhs_piece_names[p];
				})
			) +
			" cell" +
			(total === 1 ? "" : "s") +
			" now.";
	} else {
		headline = piecesInPlay(analysis).length
			? "Nothing left worth flipping."
			: "Everything worth finding is found.";
	}

	if (analysis.mode === "sheet") {
		var boards = new Set(
			analysis.W.map(function (i) {
				return analysis.sheet.worlds[i].join("").replace(/5/g, "0");
			})
		).size;
		notes.push(
			"Matched a known board pattern: " + boards + " layout" + (boards === 1 ? "" : "s") + " still possible."
		);
		if (analysis.lookingForFox && analysis.counts[0] === 0) {
			if (analysis.foxPresent === 0) {
				notes.push("Every recorded Fox spot is empty, so this game has no Fox.");
			} else {
				notes.push("Chance this game has a Fox: " + Math.round(analysis.foxPresent * 100) + "%.");
			}
		}
	} else if (analysis.mode === "off-sheet") {
		notes.push("This board isn't in the community sheet, so odds come from fitting the shapes.");
	} else if (analysis.mode === "need-blocked" && analysis.blocked.length) {
		notes.push("Mark all 5 blocked tiles to match a known board pattern.");
	}

	var outOfReach = piecesInPlay(analysis).filter(function (p) {
		return analysis.r > 0 && needFor(analysis, p) > analysis.r;
	});

	if (move.cell >= 0) {
		piecesInPlay(analysis).forEach(function (p) {
			if (outOfReach.indexOf(p) >= 0) return;
			var waiting = certainCells(p);
			if (!waiting.length) return;
			var need = needFor(analysis, p);
			var name = fhs_piece_names[p];
			if (need < waiting.length) {
				notes.push(
					"The " +
						waiting.length +
						" dashed " +
						name +
						" cells are certain and you only need " +
						need +
						". Flip " +
						(need === 1 ? "it" : "them") +
						" last; " +
						(need === 1 ? "it" : "they") +
						" won't tell you anything new."
				);
			} else {
				notes.push(
					"The " +
						waiting.length +
						" dashed " +
						name +
						" cell" +
						(waiting.length === 1
							? " is certain. Flip it last; it won't tell you anything new."
							: "s are certain. Flip them last; they won't tell you anything new.")
				);
			}
		});
	}

	outOfReach.forEach(function (p) {
		notes.push(
			"The " +
				fhs_piece_names[p] +
				" can't be finished: " +
				needFor(analysis, p) +
				" cell" +
				(needFor(analysis, p) === 1 ? "" : "s") +
				" left, " +
				analysis.r +
				" flip" +
				(analysis.r === 1 ? "" : "s") +
				". Where it could be is outlined."
		);
	});

	RenderInsights(analysis, outOfReach);
	RenderStatus(headline, notes, analysis.planning);
}

function RenderInsights(analysis, outOfReach) {
	for (var k = 0; k < 36; k++) {
		var cell = cellAt(k);
		var open = analysis.obs[k] === -1 && !isSolverFilled(cell) && analysis.blocked.length > 0;
		var chance = open ? pieceChance(analysis, k) : 0;
		cell.style.setProperty("--heat", chance.toFixed(3));
		var unflipped = analysis.obs[k] === -1;
		var unreachable =
			unflipped &&
			outOfReach.some(function (p) {
				return analysis.probs[p][k] > 0;
			});
		cell.classList.toggle("cell-out-of-reach", unreachable);
	}
}

function RenderStatus(headline, notes, planning) {
	var head = document.getElementById("prediction-live");
	var list = document.getElementById("status-notes");
	var status = document.getElementById("status");
	if (head) head.textContent = headline;
	if (status) status.classList.toggle("status-planning", !!planning);
	if (!list) return;
	list.textContent = "";
	notes.forEach(function (note) {
		var li = document.createElement("li");
		li.textContent = note;
		list.appendChild(li);
	});
}

var fhs_plan_request = 0;
var fhs_plan_worker = null;
var fhs_local_planner = null;

function planKey(analysis) {
	var v = analysis.values;
	return analysis.pattern + "|" + analysis.foxChance + "|" + v[5] + "," + v[3] + "," + v[4] + "|" + analysis.needs[4];
}

function ApplyPlan(id, result) {
	if (id !== fhs_plan_request || !window.fhs_analysis) return;
	window.fhs_analysis.planning = false;
	ShowMove(window.fhs_analysis, { cell: result.cell, ties: [], finish: result.finish });
}

function RequestPlan(analysis) {
	var id = ++fhs_plan_request;
	var message = {
		id: id,
		pattern: analysis.pattern,
		foxChance: analysis.foxChance,
		values: analysis.values,
		W: analysis.W,
		counts: analysis.counts,
		needs: analysis.needs,
		r: analysis.r
	};
	if (fhs_plan_worker === null && window.Worker) {
		try {
			fhs_plan_worker = new Worker("planner-worker.js?v=27");
			fhs_plan_worker.onmessage = function (e) {
				ApplyPlan(e.data.id, e.data.result);
			};
			fhs_plan_worker.onerror = function () {
				fhs_plan_worker = false;
				if (window.fhs_analysis && window.fhs_analysis.planning) RequestPlan(window.fhs_analysis);
			};
		} catch (e) {
			fhs_plan_worker = false;
		}
	}
	if (fhs_plan_worker) {
		fhs_plan_worker.postMessage(message);
		return;
	}
	// No worker (e.g. opened from file://): plan on the page after the quick suggestion paints.
	setTimeout(function () {
		if (id !== fhs_plan_request) return;
		var key = planKey(analysis);
		if (!fhs_local_planner || fhs_local_planner.key !== key) {
			fhs_local_planner = { key: key, planner: new FhsPlanner(analysis.sheet, analysis.values, analysis.needs) };
		}
		ApplyPlan(id, fhs_local_planner.planner.best(analysis.W, analysis.counts, analysis.r));
	}, 50);
}

function GetFlipsRemaining() {
	return fhs_flip_budget - window.fhs_flips_used;
}

function normalizeWeightInput(id, fallback) {
	var input = document.getElementById(id);
	if (!input) return fallback;
	var value = input.value.trim() === "" ? fallback : Number(input.value);
	if (!Number.isFinite(value)) value = fallback;
	value = Math.min(100, Math.max(0, value));
	input.value = String(value);
	return value;
}

function GetFoxWeight() {
	return normalizeWeightInput("foxweight", 100);
}

function NaiiveLargeProb() {
	var hitCount = 0;
	var hitMap = PrefillArray();
	var probCount = 0;
	var hitLoc = [];

	//Check for previous hit
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (window.fhs_grid[i][j] == 4) {
				if (hitCount == 0) {
					hitLoc = [i, j];
				}
				hitCount++;
			}
		}
	}

	if (hitCount > 0) {
		//Horizontals
		for (var i = 0; i < 2; i++) {
			for (var j = 0; j < 3; j++) {
				if (hitLoc[0] - (1 - i) < 0 || hitLoc[0] + i > 5 || hitLoc[1] - (2 - j) < 0 || hitLoc[1] + j > 5) {
					continue;
				}
				var coords = [
					[hitLoc[0] - (1 - i), hitLoc[1] - (2 - j)],
					[hitLoc[0] - (1 - i), hitLoc[1] - (1 - j)],
					[hitLoc[0] - (1 - i), hitLoc[1] + j],
					[hitLoc[0] + i, hitLoc[1] - (2 - j)],
					[hitLoc[0] + i, hitLoc[1] - (1 - j)],
					[hitLoc[0] + i, hitLoc[1] + j]
				];
				var blocks = [];
				blocks.push(window.fhs_grid[coords[0][0]][coords[0][1]]);
				blocks.push(window.fhs_grid[coords[1][0]][coords[1][1]]);
				blocks.push(window.fhs_grid[coords[2][0]][coords[2][1]]);
				blocks.push(window.fhs_grid[coords[3][0]][coords[3][1]]);
				blocks.push(window.fhs_grid[coords[4][0]][coords[4][1]]);
				blocks.push(window.fhs_grid[coords[5][0]][coords[5][1]]);
				var count = 0;
				var hasObstacle = false;
				for (var k = 0; k < 6; k++) {
					if (blocks[k] == 4) {
						count++;
					} else if (blocks[k] != 0) {
						hasObstacle = true;
						break;
					}
				}
				if (!hasObstacle && count == hitCount) {
					hitMap[coords[0][0]][coords[0][1]]++;
					hitMap[coords[1][0]][coords[1][1]]++;
					hitMap[coords[2][0]][coords[2][1]]++;
					hitMap[coords[3][0]][coords[3][1]]++;
					hitMap[coords[4][0]][coords[4][1]]++;
					hitMap[coords[5][0]][coords[5][1]]++;
					probCount++;
				}
			}
		}

		//Verticals
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 2; j++) {
				if (hitLoc[0] - (2 - i) < 0 || hitLoc[0] + i > 5 || hitLoc[1] - (1 - j) < 0 || hitLoc[1] + j > 5) {
					continue;
				}
				var coords = [
					[hitLoc[0] - (2 - i), hitLoc[1] - (1 - j)],
					[hitLoc[0] - (1 - i), hitLoc[1] + j],
					[hitLoc[0] + i, hitLoc[1] - (1 - j)],
					[hitLoc[0] - (2 - i), hitLoc[1] + j],
					[hitLoc[0] - (1 - i), hitLoc[1] - (1 - j)],
					[hitLoc[0] + i, hitLoc[1] + j]
				];
				var blocks = [];
				blocks.push(window.fhs_grid[coords[0][0]][coords[0][1]]);
				blocks.push(window.fhs_grid[coords[1][0]][coords[1][1]]);
				blocks.push(window.fhs_grid[coords[2][0]][coords[2][1]]);
				blocks.push(window.fhs_grid[coords[3][0]][coords[3][1]]);
				blocks.push(window.fhs_grid[coords[4][0]][coords[4][1]]);
				blocks.push(window.fhs_grid[coords[5][0]][coords[5][1]]);
				var count = 0;
				var hasObstacle = false;
				for (var k = 0; k < 6; k++) {
					if (blocks[k] == 4) {
						count++;
					} else if (blocks[k] != 0) {
						hasObstacle = true;
						break;
					}
				}
				if (!hasObstacle && count == hitCount) {
					hitMap[coords[0][0]][coords[0][1]]++;
					hitMap[coords[1][0]][coords[1][1]]++;
					hitMap[coords[2][0]][coords[2][1]]++;
					hitMap[coords[3][0]][coords[3][1]]++;
					hitMap[coords[4][0]][coords[4][1]]++;
					hitMap[coords[5][0]][coords[5][1]]++;
					probCount++;
				}
			}
		}

		if (probCount === 0) {
			return PrefillArray();
		}
		for (var i = 0; i < 6; i++) {
			for (var j = 0; j < 6; j++) {
				hitMap[i][j] /= probCount;
			}
		}

		return hitMap;
	}

	//Horizontal
	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 4; j++) {
			var block1 = window.fhs_grid[i][j];
			var block2 = window.fhs_grid[i][j + 1];
			var block3 = window.fhs_grid[i][j + 2];
			var block4 = window.fhs_grid[i + 1][j];
			var block5 = window.fhs_grid[i + 1][j + 1];
			var block6 = window.fhs_grid[i + 1][j + 2];
			if (block1 != 0 || block2 != 0 || block3 != 0 || block4 != 0 || block5 != 0 || block6 != 0) {
				continue;
			} else {
				hitMap[i][j]++;
				hitMap[i][j + 1]++;
				hitMap[i][j + 2]++;
				hitMap[i + 1][j]++;
				hitMap[i + 1][j + 1]++;
				hitMap[i + 1][j + 2]++;
				probCount++;
			}
		}
	}

	//Vertical
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 5; j++) {
			var block1 = window.fhs_grid[i][j];
			var block2 = window.fhs_grid[i][j + 1];
			var block3 = window.fhs_grid[i + 1][j];
			var block4 = window.fhs_grid[i + 1][j + 1];
			var block5 = window.fhs_grid[i + 2][j];
			var block6 = window.fhs_grid[i + 2][j + 1];
			if (block1 != 0 || block2 != 0 || block3 != 0 || block4 != 0 || block5 != 0 || block6 != 0) {
				continue;
			} else {
				hitMap[i][j]++;
				hitMap[i][j + 1]++;
				hitMap[i + 1][j]++;
				hitMap[i + 1][j + 1]++;
				hitMap[i + 2][j]++;
				hitMap[i + 2][j + 1]++;
				probCount++;
			}
		}
	}

	if (probCount === 0) {
		return PrefillArray();
	}
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			hitMap[i][j] /= probCount;
		}
	}

	return hitMap;
}

//	Probability of a medium in a spot without factoring in other logos
function NaiiveMedProb() {
	var map = PrefillArray();
	var count = 0;
	var hitCount = 0;
	var hitLoc = [];

	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (window.fhs_grid[i][j] == 3) {
				hitCount++;
				hitLoc = [i, j];
			}
		}
	}

	if (hitCount > 0) {
		for (var i = -1; i < 1; i++) {
			for (var j = -1; j < 1; j++) {
				if (hitLoc[0] + i < 0 || hitLoc[0] + 1 + i > 5 || hitLoc[1] + j < 0 || hitLoc[1] + 1 + j > 5) {
					continue;
				}
				var coords = [
					[hitLoc[0] + i, hitLoc[1] + j],
					[hitLoc[0] + i, hitLoc[1] + j + 1],
					[hitLoc[0] + i + 1, hitLoc[1] + j],
					[hitLoc[0] + i + 1, hitLoc[1] + j + 1]
				];
				var tempCount = 0;
				var noObstacles = true;
				for (var k = 0; k < 4; k++) {
					if (window.fhs_grid[coords[k][0]][coords[k][1]] == 3) {
						tempCount++;
					} else if (window.fhs_grid[coords[k][0]][coords[k][1]] != 0) {
						noObstacles = false;
						break;
					}
				}
				if (noObstacles && tempCount == hitCount) {
					for (var k = 0; k < 4; k++) {
						map[coords[k][0]][coords[k][1]]++;
					}
					count++;
				}
			}
		}
	} else {
		for (var i = 0; i < 5; i++) {
			for (var j = 0; j < 5; j++) {
				if (
					window.fhs_grid[i][j] != 0 ||
					window.fhs_grid[i][j + 1] != 0 ||
					window.fhs_grid[i + 1][j] != 0 ||
					window.fhs_grid[i + 1][j + 1] != 0
				) {
					continue;
				} else {
					count++;
					map[i][j]++;
					map[i][j + 1]++;
					map[i + 1][j]++;
					map[i + 1][j + 1]++;
				}
			}
		}
	}
	//Turn into probabilities
	if (count === 0) {
		return PrefillArray();
	}
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			map[i][j] /= count;
		}
	}
	return map;
}

function CalculateFullProb() {
	// 6x6x3 array zero filled
	var hitMap = new Array(6).fill(0).map(() => new Array(6).fill(0).map(() => new Array(3).fill(0)));
	var hitCount = 0;
	var currentHits = [0, 0, 0];

	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (window.fhs_grid[i][j] == 5) {
				currentHits[0]++;
			}
			if (window.fhs_grid[i][j] == 3) {
				currentHits[1]++;
			}
			if (window.fhs_grid[i][j] == 4) {
				currentHits[2]++;
			}
		}
	}

	//LOTS OF FOR LOOPS INCOMING
	/*
	Method:
	
	For every placement of the small
		if placement contains currently placed small
			For every placement of the medium given each placement of small
				if placement contains all currently placed mediums
					Again for each orientation of the large
						if placement contains all currently placed larges
							Count placements for all shapes
	
	This should give all possible placements of all three given the current board
	*/
	for (var iSm = 0; iSm < 6; iSm++) {
		for (var jSm = 0; jSm < 6; jSm++) {
			if (
				(window.fhs_grid[iSm][jSm] == 0 && currentHits[0] == 0) ||
				(window.fhs_grid[iSm][jSm] == 5 && currentHits[0] != 0)
			) {
				// Deep copy
				var gridSmallAdded = JSON.parse(JSON.stringify(window.fhs_grid));
				gridSmallAdded[iSm][jSm] = 5;

				for (var iMed = 0; iMed < 5; iMed++) {
					for (var jMed = 0; jMed < 5; jMed++) {
						var medBlocks = [
							gridSmallAdded[iMed][jMed],
							gridSmallAdded[iMed][jMed + 1],
							gridSmallAdded[iMed + 1][jMed],
							gridSmallAdded[iMed + 1][jMed + 1]
						];

						var medTotalInPlacement = 0;
						for (var i = 0; i < 4; i++) {
							if (medBlocks[i] == 3) {
								medTotalInPlacement++;
							}
						}

						if (
							medTotalInPlacement == currentHits[1] &&
							(medBlocks[0] == 0 || medBlocks[0] == 3) &&
							(medBlocks[1] == 0 || medBlocks[1] == 3) &&
							(medBlocks[2] == 0 || medBlocks[2] == 3) &&
							(medBlocks[3] == 0 || medBlocks[3] == 3)
						) {
							var gridMedAdded = JSON.parse(JSON.stringify(gridSmallAdded));
							gridMedAdded[iMed][jMed] = 3;
							gridMedAdded[iMed][jMed + 1] = 3;
							gridMedAdded[iMed + 1][jMed] = 3;
							gridMedAdded[iMed + 1][jMed + 1] = 3;

							//Horizontal Larges
							for (var iLg = 0; iLg < 5; iLg++) {
								for (var jLg = 0; jLg < 4; jLg++) {
									var largeBlocks = [
										gridMedAdded[iLg][jLg],
										gridMedAdded[iLg][jLg + 1],
										gridMedAdded[iLg][jLg + 2],
										gridMedAdded[iLg + 1][jLg],
										gridMedAdded[iLg + 1][jLg + 1],
										gridMedAdded[iLg + 1][jLg + 2]
									];

									var largeTotalInPlacement = 0;
									for (var j = 0; j < 6; j++) {
										if (largeBlocks[j] == 4) {
											largeTotalInPlacement++;
										}
									}

									if (
										largeTotalInPlacement == currentHits[2] &&
										(largeBlocks[0] == 0 || largeBlocks[0] == 4) &&
										(largeBlocks[1] == 0 || largeBlocks[1] == 4) &&
										(largeBlocks[2] == 0 || largeBlocks[2] == 4) &&
										(largeBlocks[3] == 0 || largeBlocks[3] == 4) &&
										(largeBlocks[4] == 0 || largeBlocks[4] == 4) &&
										(largeBlocks[5] == 0 || largeBlocks[5] == 4)
									) {
										hitMap[iSm][jSm][0]++;

										hitMap[iMed][jMed][1]++;
										hitMap[iMed][jMed + 1][1]++;
										hitMap[iMed + 1][jMed][1]++;
										hitMap[iMed + 1][jMed + 1][1]++;

										hitMap[iLg][jLg][2]++;
										hitMap[iLg][jLg + 1][2]++;
										hitMap[iLg][jLg + 2][2]++;
										hitMap[iLg + 1][jLg][2]++;
										hitMap[iLg + 1][jLg + 1][2]++;
										hitMap[iLg + 1][jLg + 2][2]++;
										hitCount++;
									}
								}
							}
							// End Horizontal Larges

							//Vertical Larges
							for (var iLg = 0; iLg < 4; iLg++) {
								for (var jLg = 0; jLg < 5; jLg++) {
									var largeBlocks = [
										gridMedAdded[iLg][jLg],
										gridMedAdded[iLg][jLg + 1],
										gridMedAdded[iLg + 1][jLg],
										gridMedAdded[iLg + 1][jLg + 1],
										gridMedAdded[iLg + 2][jLg],
										gridMedAdded[iLg + 2][jLg + 1]
									];

									var largeTotalInPlacement = 0;
									for (var j = 0; j < 6; j++) {
										if (largeBlocks[j] == 4) {
											largeTotalInPlacement++;
										}
									}

									if (
										largeTotalInPlacement == currentHits[2] &&
										(largeBlocks[0] == 0 || largeBlocks[0] == 4) &&
										(largeBlocks[1] == 0 || largeBlocks[1] == 4) &&
										(largeBlocks[2] == 0 || largeBlocks[2] == 4) &&
										(largeBlocks[3] == 0 || largeBlocks[3] == 4) &&
										(largeBlocks[4] == 0 || largeBlocks[4] == 4) &&
										(largeBlocks[5] == 0 || largeBlocks[5] == 4)
									) {
										hitMap[iSm][jSm][0]++;

										hitMap[iMed][jMed][1]++;
										hitMap[iMed][jMed + 1][1]++;
										hitMap[iMed + 1][jMed][1]++;
										hitMap[iMed + 1][jMed + 1][1]++;

										hitMap[iLg][jLg][2]++;
										hitMap[iLg][jLg + 1][2]++;
										hitMap[iLg + 1][jLg][2]++;
										hitMap[iLg + 1][jLg + 1][2]++;
										hitMap[iLg + 2][jLg][2]++;
										hitMap[iLg + 2][jLg + 1][2]++;
										hitCount++;
									}
								}
							}
							// End Vertical Larges
						}
					}
				} // End Mediums
			}
		}
	} // End Smalls

	// Probabilities Time

	//LARGE HIT COUNT IS THE SAME AS TOTAL BOARD CONFIGS
	//Formula: number of hits/total board configs
	var probabilityMaps = [PrefillArray(), PrefillArray(), PrefillArray()];

	if (hitCount === 0) {
		return probabilityMaps;
	}
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			probabilityMaps[0][i][j] = hitMap[i][j][0] / hitCount;
			probabilityMaps[1][i][j] = hitMap[i][j][1] / hitCount;
			probabilityMaps[2][i][j] = hitMap[i][j][2] / hitCount;
		}
	}

	return probabilityMaps;
}

// Functionally similar to CalculateFullProb()
// Doesn't add Fox to calculation.
function CalculateProbWithoutFox() {
	// 6x6x3 array zero filled
	var hitMap = new Array(6).fill(0).map(() => new Array(6).fill(0).map(() => new Array(2).fill(0)));
	var hitCount = 0;
	var currentHits = [0, 0];

	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (window.fhs_grid[i][j] == 3) {
				currentHits[0]++;
			}
			if (window.fhs_grid[i][j] == 4) {
				currentHits[1]++;
			}
		}
	}

	for (var iMed = 0; iMed < 5; iMed++) {
		for (var jMed = 0; jMed < 5; jMed++) {
			var medBlocks = [
				window.fhs_grid[iMed][jMed],
				window.fhs_grid[iMed][jMed + 1],
				window.fhs_grid[iMed + 1][jMed],
				window.fhs_grid[iMed + 1][jMed + 1]
			];

			var medTotalInPlacement = 0;
			for (var i = 0; i < 4; i++) {
				if (medBlocks[i] == 3) {
					medTotalInPlacement++;
				}
			}

			if (
				medTotalInPlacement == currentHits[0] &&
				(medBlocks[0] == 0 || medBlocks[0] == 3) &&
				(medBlocks[1] == 0 || medBlocks[1] == 3) &&
				(medBlocks[2] == 0 || medBlocks[2] == 3) &&
				(medBlocks[3] == 0 || medBlocks[3] == 3)
			) {
				var gridMedAdded = JSON.parse(JSON.stringify(window.fhs_grid));
				gridMedAdded[iMed][jMed] = 3;
				gridMedAdded[iMed][jMed + 1] = 3;
				gridMedAdded[iMed + 1][jMed] = 3;
				gridMedAdded[iMed + 1][jMed + 1] = 3;

				//Horizontal Larges
				for (var iLg = 0; iLg < 5; iLg++) {
					for (var jLg = 0; jLg < 4; jLg++) {
						var largeBlocks = [
							gridMedAdded[iLg][jLg],
							gridMedAdded[iLg][jLg + 1],
							gridMedAdded[iLg][jLg + 2],
							gridMedAdded[iLg + 1][jLg],
							gridMedAdded[iLg + 1][jLg + 1],
							gridMedAdded[iLg + 1][jLg + 2]
						];

						var largeTotalInPlacement = 0;
						for (var j = 0; j < 6; j++) {
							if (largeBlocks[j] == 4) {
								largeTotalInPlacement++;
							}
						}

						if (
							largeTotalInPlacement == currentHits[1] &&
							(largeBlocks[0] == 0 || largeBlocks[0] == 4) &&
							(largeBlocks[1] == 0 || largeBlocks[1] == 4) &&
							(largeBlocks[2] == 0 || largeBlocks[2] == 4) &&
							(largeBlocks[3] == 0 || largeBlocks[3] == 4) &&
							(largeBlocks[4] == 0 || largeBlocks[4] == 4) &&
							(largeBlocks[5] == 0 || largeBlocks[5] == 4)
						) {
							hitMap[iMed][jMed][0]++;
							hitMap[iMed][jMed + 1][0]++;
							hitMap[iMed + 1][jMed][0]++;
							hitMap[iMed + 1][jMed + 1][0]++;

							hitMap[iLg][jLg][1]++;
							hitMap[iLg][jLg + 1][1]++;
							hitMap[iLg][jLg + 2][1]++;
							hitMap[iLg + 1][jLg][1]++;
							hitMap[iLg + 1][jLg + 1][1]++;
							hitMap[iLg + 1][jLg + 2][1]++;
							hitCount++;
						}
					}
				} // End Horizontal Larges

				//Vertical Larges
				for (var iLg = 0; iLg < 4; iLg++) {
					for (var jLg = 0; jLg < 5; jLg++) {
						var largeBlocks = [
							gridMedAdded[iLg][jLg],
							gridMedAdded[iLg][jLg + 1],
							gridMedAdded[iLg + 1][jLg],
							gridMedAdded[iLg + 1][jLg + 1],
							gridMedAdded[iLg + 2][jLg],
							gridMedAdded[iLg + 2][jLg + 1]
						];

						var largeTotalInPlacement = 0;
						for (var j = 0; j < 6; j++) {
							if (largeBlocks[j] == 4) {
								largeTotalInPlacement++;
							}
						}

						if (
							largeTotalInPlacement == currentHits[1] &&
							(largeBlocks[0] == 0 || largeBlocks[0] == 4) &&
							(largeBlocks[1] == 0 || largeBlocks[1] == 4) &&
							(largeBlocks[2] == 0 || largeBlocks[2] == 4) &&
							(largeBlocks[3] == 0 || largeBlocks[3] == 4) &&
							(largeBlocks[4] == 0 || largeBlocks[4] == 4) &&
							(largeBlocks[5] == 0 || largeBlocks[5] == 4)
						) {
							hitMap[iMed][jMed][0]++;
							hitMap[iMed][jMed + 1][0]++;
							hitMap[iMed + 1][jMed][0]++;
							hitMap[iMed + 1][jMed + 1][0]++;

							hitMap[iLg][jLg][1]++;
							hitMap[iLg][jLg + 1][1]++;
							hitMap[iLg + 1][jLg][1]++;
							hitMap[iLg + 1][jLg + 1][1]++;
							hitMap[iLg + 2][jLg][1]++;
							hitMap[iLg + 2][jLg + 1][1]++;
							hitCount++;
						}
					}
				} // End Vertical Larges
			}
		}
	} // End Mediums

	// Probabilities Time

	//LARGE HIT COUNT IS THE SAME AS TOTAL BOARD CONFIGS
	//Formula: number of hits/total board configs
	var probabilityMaps = [PrefillArray(), PrefillArray()];

	if (hitCount === 0) {
		return probabilityMaps;
	}
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			probabilityMaps[0][i][j] = hitMap[i][j][0] / hitCount;
			probabilityMaps[1][i][j] = hitMap[i][j][1] / hitCount;
		}
	}

	return probabilityMaps;
}

/*

	Run on startup.

*/
function StartUp() {
	ResetBoard();
}
StartUp();
