const fhs_blocked_icon_url = "images/blocked.png";
const fhs_missed_icon_url = "images/missed.png";
const fhs_chest_icon_url = "images/chest.png";
const fhs_present_icon_url = "images/present.png";
const fhs_swords_icon_url = "images/swords.png";
const fhs_fox_icon_url = "images/fox.png";
const fhs_erase_icon_url = "images/erase.png";
const fhs_prediction_icon_url = "images/prediction.png";
const fhs_verified_icon_url = "images/verified.png";
const fhs_sighting_icon_url = "images/sighting.png";
const fhs_blank_icon_uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=";

const fhs_blocked_color = "rgb(140, 140, 140)";
const fhs_missed_color = "rgb(255, 80, 80)";
const fhs_chest_color = "rgb(102, 255, 51)";
const fhs_swords_color = "rgb(51, 204, 255)";
const fhs_fox_color = "rgb(153, 51, 204)";
const fhs_empty_color = "rgb(237, 225, 200)";
const fhs_prediction_color = "rgb(255,215,0)";
const fhs_verified_color = "rgb(255,51,255)";
const fhs_sighting_color = "rgb(255,153,51)";

const fhs_blocked_name = "Blocked";
const fhs_missed_name = "Missed";
const fhs_chest_name = "Coffer";
const fhs_present_name = "Gift Box";
const fhs_swords_name = "Swords";
const fhs_fox_name = "Fox";
const fhs_empty_name = "Empty";
const fhs_prediction_name = "Prediction";
const fhs_verified_name = "Verified Sighting";
const fhs_sighting_name = "Sighting";

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

function IndexFormat(index) {
	var str = "0" + index;
	return str.substr(str.length - 2);
}

function isFlipState(state) {
	return state === fhs_missed_state
		|| state === fhs_chest_state
		|| state === fhs_swords_state
		|| state === fhs_fox_state;
}

function canBePredictionTarget(state) {
	return state === fhs_empty_state
		|| state === fhs_verified_state
		|| state === fhs_sighting_state
		|| state === fhs_prediction_state
		|| state === fhs_prediction_verified_state
		|| state === fhs_prediction_sighting_state;
}

const CELL_META = {
	[fhs_empty_state]: {
		name: function() { return fhs_empty_name; },
		color: fhs_empty_color,
		icon: function() { return fhs_blank_icon_uri; },
		diagonalMix: false
	},
	[fhs_blocked_state]: {
		name: function() { return fhs_blocked_name; },
		color: fhs_blocked_color,
		icon: function() { return fhs_blocked_icon_url; },
		diagonalMix: false
	},
	[fhs_missed_state]: {
		name: function() { return fhs_missed_name; },
		color: fhs_missed_color,
		icon: function() { return fhs_missed_icon_url; },
		diagonalMix: false
	},
	[fhs_chest_state]: {
		name: function() { return chestOrPresentName(); },
		color: fhs_chest_color,
		icon: function() { return chestOrPresentURL(); },
		diagonalMix: false
	},
	[fhs_swords_state]: {
		name: function() { return fhs_swords_name; },
		color: fhs_swords_color,
		icon: function() { return fhs_swords_icon_url; },
		diagonalMix: false
	},
	[fhs_fox_state]: {
		name: function() { return fhs_fox_name; },
		color: fhs_fox_color,
		icon: function() { return fhs_fox_icon_url; },
		diagonalMix: false
	},
	[fhs_prediction_state]: {
		name: function() { return fhs_prediction_name; },
		color: fhs_prediction_color,
		icon: function() { return fhs_prediction_icon_url; },
		diagonalMix: false
	},
	[fhs_verified_state]: {
		name: function() { return fhs_verified_name; },
		color: fhs_verified_color,
		icon: function() { return fhs_verified_icon_url; },
		diagonalMix: false
	},
	[fhs_sighting_state]: {
		name: function() { return fhs_sighting_name; },
		color: fhs_sighting_color,
		icon: function() { return fhs_sighting_icon_url; },
		diagonalMix: false
	},
	[fhs_prediction_verified_state]: {
		name: function() { return fhs_prediction_name + " and " + fhs_verified_name; },
		color: fhs_verified_color,
		icon: function() { return fhs_prediction_icon_url; },
		diagonalMix: true
	},
	[fhs_prediction_sighting_state]: {
		name: function() { return fhs_prediction_name + " and " + fhs_sighting_name; },
		color: fhs_sighting_color,
		icon: function() { return fhs_prediction_icon_url; },
		diagonalMix: false
	}
};

const fhs_sheet_patterns = [
	[ 8,10,13,26,35],
	[ 9,13,16,28,30],
	[ 0, 9,22,25,27],
	[ 5, 7,19,22,26],
	[ 3,13,16,21,32],
	[ 9,12,20,23,27],
	[ 3,14,19,22,32],
	[ 8,12,15,23,26],
	[ 4, 7,15,25,33],
	[ 7,10,18,21,29],
	[ 2,10,20,28,31],
	[ 6,14,17,25,28],
	[ 7,16,18,27,32],
	[ 2,10,12,19,27],
	[ 3, 8,17,19,28],
	[ 8,16,23,25,33]
];

document.addEventListener("keydown", function(event) {
	var isEditingWeights = false;
	var weights = document.querySelectorAll("input[type=number]");
	var selection = document.activeElement;
	Array.prototype.forEach.call(weights, function(weight) {
		if(weight == selection) {
			isEditingWeights = true;
		}
	});
	if(!isEditingWeights) {
		var index = -1;
		switch (event.key) {
			case '1':
				index = 0;
				break;
			case '2':
				index = 1;
				break;
			case '3':
				index = 2;
				break;
			case '4':
				index = 3;
				break;
			case '5':
				index = 4;
				break;
			case '6':
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

document.getElementById("advancedsettings").addEventListener("change", function()   {
	SaveSettings();
});

document.addEventListener("DOMContentLoaded", function() {
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
		foxweight: document.getElementById("foxweight").value,
		boxweight: document.getElementById("boxweight").value,
		boxType: document.getElementById("box1").checked ? "coffer" : "present",
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

	if (settingsObject.boxType === "present") {
		document.getElementById("box2").checked = true;
	} else {
		document.getElementById("box1").checked = true;
	}
	UpdateCoffer();

	if (settingsObject.foxweight != null) {
		document.getElementById("foxweight").value = settingsObject.foxweight;
	}
	if (settingsObject.boxweight != null) {
		document.getElementById("boxweight").value = settingsObject.boxweight;
	}

	// Retelling owns sword weight (overwrites any custom sword value)
	applyGameWeekPreset();

	if (settingsObject.advancedOpen) {
		var collapse = document.getElementById("collapsebox");
		var arrow = document.getElementById("arrow");
		if (collapse && !collapse.style.maxHeight) {
			collapse.style.maxHeight = collapse.scrollHeight + "px";
			if (arrow) arrow.classList.add("arrow-rotated");
			updateBoardMax();
		}
	}
}



/*

	Begin Collapse and Reset Listeners

*/

document.getElementById("menucollapse").addEventListener("click", function() {
	var arrow = document.getElementById("arrow");
	arrow.classList.toggle("arrow-rotated");
	var collapse = document.getElementById("collapsebox");
	if (collapse.style.maxHeight) {
		collapse.style.maxHeight = null;
	} else {
		collapse.style.maxHeight = collapse.scrollHeight + "px";
	}
	updateBoardMax();
	SaveSettings();
});
var collapselabel = document.getElementById("collapselabel");
collapselabel.addEventListener("mousedown", function() {
	var cbutton = document.getElementById("collapselabel");
	if(!cbutton.classList.contains("advanced-collapse-pressed")) {
		cbutton.classList.add("advanced-collapse-pressed");
	}
});
function removeCollapsePressed() {
	var cbutton = document.getElementById("collapselabel");
	if(cbutton.classList.contains("advanced-collapse-pressed")) {
		cbutton.classList.remove("advanced-collapse-pressed");
	}
}
collapselabel.addEventListener("mouseup", removeCollapsePressed);
collapselabel.addEventListener("mouseleave", removeCollapsePressed);

document.getElementById("resetbutton").addEventListener("click", function() {
	ResetBoard();
});
var resetlabel = document.getElementById("resetbuttonlabel");
resetlabel.addEventListener("mousedown", function() {
	var rbutton = document.getElementById("resetbuttonlabel");
	if(!rbutton.classList.contains("reset-button-pressed")) {
		rbutton.classList.add("reset-button-pressed");
	}
});
function removeResetPressed() {
	var rbutton = document.getElementById("resetbuttonlabel");
	if(rbutton.classList.contains("reset-button-pressed")) {
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
			'<img src="' + fhs_blank_icon_uri + '" alt="" class="board-cell-icon" draggable="false">' +
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

	cell.addEventListener("pointerdown", function(e) {
		if (e.pointerType === "mouse" && e.button !== 0) return;
		moved = false;
		startX = e.clientX;
		startY = e.clientY;
		clearPress();
		pressTimer = setTimeout(function() {
			pressTimer = null;
			if (moved) return;
			if (cell.getAttribute("data-state") === fhs_empty_state) return;
			fhs_suppress_click = true;
			applyCellMark(cell, "clear", true);
		}, 450);
	});
	cell.addEventListener("pointermove", function(e) {
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
Array.prototype.forEach.call(cells, function(cell) {
	cell.addEventListener("click", CellClick);
	cell.addEventListener("keydown", function(e) {
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
spreadsheet.addEventListener("click", function() {
	ClearSightings();
	UpdateSightings();
	SaveSettings();
});

var weightFeilds = document.querySelectorAll("input[type=number]");
Array.prototype.forEach.call(weightFeilds, function(weight) {
	weight.addEventListener("change", function() {
		LiveUpdate();
		SaveSettings();
	});
});

var gameWeekRadios = document.querySelectorAll("input[type=radio][name=gameweek]");
Array.prototype.forEach.call(gameWeekRadios, function(radio) {
	radio.addEventListener("change", applyGameWeekPreset);
});

document.querySelectorAll('input[name="boxtype"]').forEach(function(radio) {
	radio.addEventListener("change", function() {
		UpdateCoffer();
		SaveSettings();
		LiveUpdate();
	});
});

var showstatsEl = document.getElementById("showstats");
if (showstatsEl) {
	showstatsEl.addEventListener("change", function() {
		ScoresCheckUpdate();
		SaveSettings();
	});
}
var liveupdateEl = document.getElementById("liveupdate");
if (liveupdateEl) {
	liveupdateEl.addEventListener("change", function() {
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

window.addEventListener("scroll", function() {
	var shrink = siteHeader.classList.contains("shrink");
	var contentTop = contentPane.getBoundingClientRect().top;
	var shouldShrink = contentTop <= fhs_header_expanded_bottom
		? true
		: (contentTop > fhs_header_expanded_bottom + fhs_shrink_band ? false : shrink);
	if (shouldShrink !== shrink) {
		siteHeader.classList.toggle("shrink", shouldShrink);
	}
}, { passive: true });

// The picker bar is position: sticky so it stays reachable while scrolling the board.
// A sticky bottom element docks at the viewport's bottom edge as soon as its normal
// position would otherwise fall below the fold - reserving space *before* it in the
// flow doesn't stop that, since the dock point is measured from the viewport, not from
// how much room precedes the bar. So instead of reserving space for the bar, cap the
// board so the header, board, gap, and bar all fit within one viewport at rest; sticky
// only engages once content genuinely exceeds the viewport (e.g. Advanced expanded on
// a short screen), which is what it's for.
var controlsBarEl = document.querySelector(".controls-sticky");
var boardGapEl = document.querySelector(".h-separator");
var boardEl = document.getElementById("board");
function updateBoardMax() {
	if (!boardEl || !controlsBarEl || !boardGapEl) return;
	var boardTop = boardEl.getBoundingClientRect().top + window.scrollY;
	var contentBottomPad = parseFloat(getComputedStyle(contentPane).paddingBottom) || 0;
	var bodyBottomPad = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
	var available = window.innerHeight - boardTop - boardGapEl.offsetHeight - controlsBarEl.offsetHeight - contentBottomPad - bodyBottomPad;
	document.documentElement.style.setProperty("--fhs-board-max", Math.max(220, Math.floor(available)) + "px");
}
if (controlsBarEl) {
	updateBoardMax();
	window.addEventListener("resize", updateBoardMax);
	if (window.ResizeObserver) {
		new ResizeObserver(updateBoardMax).observe(controlsBarEl);
	}
}

/*

	End Listeners

*/



window.fhs_undo = [];
const fhs_undo_max = 20;
var fhs_suppress_click = false;

function pickerItemToState(pickedItem) {
	switch (pickedItem) {
		case "blocked": return fhs_blocked_state;
		case "missed": return fhs_missed_state;
		case "chest": return fhs_chest_state;
		case "swords": return fhs_swords_state;
		case "fox": return fhs_fox_state;
		case "clear": return fhs_empty_state;
		default: return null;
	}
}

function pushUndo(cellId, prevState, flipDelta) {
	window.fhs_undo.push({ id: cellId, prevState: prevState, flipDelta: flipDelta });
	if (window.fhs_undo.length > fhs_undo_max) {
		window.fhs_undo.shift();
	}
}

function applyCellMark(cell, pickedItem, fromLongPress) {
	var prevState = cell.getAttribute("data-state");
	var newState = pickerItemToState(pickedItem);
	if (newState == null) {
		console.error("Radio button value invalid.");
		return;
	}
	if (prevState === newState) {
		return;
	}

	var wasFlip = isFlipState(prevState);
	var isFlip = isFlipState(newState);
	var flipDelta = 0;
	if (!wasFlip && isFlip) {
		flipDelta = 1;
	} else if (wasFlip && !isFlip) {
		flipDelta = -1;
	}

	pushUndo(cell.id, prevState, flipDelta);
	cell.setAttribute("data-state", newState);
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
	window.fhs_flips_used = Math.max(0, window.fhs_flips_used - entry.flipDelta);
	UpdateFlipCounter();
	UpdateCell(cell);
	LiveUpdate();
}

document.addEventListener("keydown", function(event) {
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
	if(this.style.opacity < 1) {
		this.style.opacity = 1;
	} else {
		this.style.opacity = 0.9;
	}
}

// Called on MouseEnter and MouseLeave events for the picker radio buttons.
function radioOpacity() {
	if(this.style.opacity < 1) {
		this.style.opacity = 1;
	} else {
		this.style.opacity = 0.8;
	}
}

function getPickerMenuItem() {
	return document.querySelector("input[name='pickeritem']:checked").value;
}

function updateTitles() {
	var cells = document.getElementsByClassName('board-cell');
	Array.prototype.forEach.call(cells, function(cell) {
		switch(cell.getAttribute('data-state')) {
			case fhs_empty_state:
				cell.setAttribute('title', fhs_empty_name);
				break;
			case fhs_blocked_state:
				cell.setAttribute('title', fhs_blocked_name);
				break;
			case fhs_missed_state:
				cell.setAttribute('title', fhs_missed_name);
				break;
			case fhs_chest_state:
				cell.setAttribute('title', chestOrPresentName());
				break;
			case fhs_swords_state:
				cell.setAttribute('title', fhs_swords_name);
				break;
			case fhs_fox_state:
				cell.setAttribute('title', fhs_fox_name);
				break;
			case fhs_prediction_state:
				cell.setAttribute('title', fhs_prediction_name);
				break;
			case fhs_verified_state:
				cell.setAttribute('title', fhs_verified_name);
				break;
			case fhs_sighting_state:
				cell.setAttribute('title', fhs_sighting_name);
				break;
			case fhs_prediction_verified_state:
				cell.setAttribute('title', fhs_prediction_name + " and " + fhs_verified_name);
				break;
			case fhs_prediction_sighting_state:
				cell.setAttribute('title', fhs_prediction_name + " and " + fhs_sighting_name);
				break;
			default:
				break;
		}
	});
}

function UpdateCoffer() {
	var pickerlabel = document.querySelector("label[for=button3]");
	var pickerimg = document.getElementById("button3").children[1];
	var weightlabel = document.getElementById("boxweightlabel");
	var weight = document.getElementById("boxweight");
	var name = chestOrPresentName();
	var url = chestOrPresentURL();

	pickerlabel.innerHTML = name;
	pickerimg.src = url;
	weightlabel.innerHTML = name;
	
	if(isCofferSet()) {
		weight.value = 35;
	} else {
		weight.value = 25;
	}
	
	var cells = document.getElementsByClassName('board-cell');
	Array.prototype.forEach.call(cells, function(cell) {
		var childImage = cell.querySelector("img");
		var state_value = cell.getAttribute("data-state");
		if (state_value == fhs_chest_state) {
			childImage.setAttribute('src', url);
			cell.setAttribute('title', name);
		}
	});
}

function isCofferSet() {
	return document.getElementById("box1").checked;
}

function chestOrPresentName() {
	if(isCofferSet()) {
		return fhs_chest_name;
	} else {
		return fhs_present_name;
	}
}

function chestOrPresentURL() {
	if(isCofferSet()) {
		return fhs_chest_icon_url;
	} else {
		return fhs_present_icon_url;
	}
}

// Swords is only worth its 15-leaf payout on its own; in Game 1 finding it also
// unlocks a whole second game via a retelling, which dwarfs the raw reward.
const fhs_sword_weight_hunting_retelling = 90;
const fhs_sword_weight_raw = 15;

function applyGameWeekPreset() {
	var huntingRetelling = document.getElementById("gameweek1").checked;
	document.getElementById("swordweight").value = huntingRetelling
		? fhs_sword_weight_hunting_retelling
		: fhs_sword_weight_raw;
	SaveSettings();
	LiveUpdate();
}

function doFoxSightings() {
	return document.getElementById("spreadsheet").checked;
}

function doLiveUpdate() {
	return document.getElementById("liveupdate").checked;
}

function LiveUpdate() {
	if(doLiveUpdate()) {
		runGuaranteed();
	}
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
	cell.classList.toggle("diagonal-mix", !!meta.diagonalMix);
	var idx = parseInt(cell.getAttribute("data-index"), 10);
	if (!isNaN(idx)) {
		var row = Math.floor(idx / 6) + 1;
		var col = (idx % 6) + 1;
		cell.setAttribute("aria-label", "Row " + row + ", column " + col + ", " + name);
	}
}

function UpdateGrid() {
	var cells = document.getElementsByClassName('board-cell');
	Array.prototype.forEach.call(cells, function(cell) {
		UpdateCell(cell);
	});
}

function ScoresCheckUpdate() {
	if(QueryShowScores()) {
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
			if (canBePredictionTarget(state) || state == fhs_prediction_state ||
				state == fhs_prediction_verified_state ||
				state == fhs_prediction_sighting_state ||
				state == fhs_empty_state || state == fhs_verified_state ||
				state == fhs_sighting_state) {
				var v = window.fhs_grid_scores[i][j];
				if (Number.isFinite(v)) {
					next = v.toFixed(2);
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
	Array.prototype.forEach.call(cells, function(cell) {
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
			if (state == fhs_prediction_state ||
				state == fhs_verified_state ||
				state == fhs_sighting_state ||
				state == fhs_prediction_sighting_state ||
				state == fhs_prediction_verified_state) {
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
			if (state == fhs_verified_state ||
				state == fhs_sighting_state) {
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
	Array.prototype.forEach.call(cells, function(cell) {
		cell.setAttribute("data-state", fhs_empty_state);
		UpdateCell(cell);
	});
	window.fhs_grid_scores = PrefillArray();
	UpdateScoresInCells();
	window.fhs_flips_used = 0;
	window.fhs_undo = [];
	UpdateFlipCounter();
	var live = document.getElementById("prediction-live");
	if (live) live.textContent = "";
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

function ParseGrid() {
	window.fhs_grid = PrefillArray();
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			
			var numStr = IndexFormat(j + 6 * i);
			var cell = document.getElementById("cell" + numStr);
			var state = cell.getAttribute("data-state");
			
			if (state == fhs_blocked_state) {
				window.fhs_grid[i][j] = 1;
			}
			else if (state == fhs_missed_state) {
				window.fhs_grid[i][j] = 2;
			}
			else if (state == fhs_chest_state) {
				window.fhs_grid[i][j] = 3;
			}
			else if (state == fhs_swords_state) {
				window.fhs_grid[i][j] = 4;
			}
			else if (state == fhs_fox_state) {
				window.fhs_grid[i][j] = 5;
			}
			else {
				// Empty, Verified, Sighting, and Prediction states
				window.fhs_grid[i][j] = 0;
			}
		}
	}
}

function UpdatePrediction() {
	var blockedCount = 0;
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (window.fhs_grid[i][j] == 1) {
				blockedCount++;
			}
		}
	}
	if (blockedCount == 0) {
		return;
	}

	var maxScore = 0;
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			var numStr = IndexFormat(j + 6 * i);
			var cell = document.getElementById("cell" + numStr);
			
			var state = cell.getAttribute("data-state");
			
			if (state == fhs_prediction_state) {
				cell.setAttribute("data-state", fhs_empty_state);
				UpdateCell(cell);
				maxScore = Math.max(fhs_grid_scores[i][j], maxScore);
			} else if (state == fhs_prediction_verified_state) {
				cell.setAttribute("data-state", fhs_verified_state);
				UpdateCell(cell);
				maxScore = Math.max(fhs_grid_scores[i][j], maxScore);
			} else if (state == fhs_prediction_sighting_state) {
				cell.setAttribute("data-state", fhs_sighting_state);
				UpdateCell(cell);
				maxScore = Math.max(fhs_grid_scores[i][j], maxScore);
			} else if (state == fhs_empty_state ||
					   state == fhs_verified_state ||
					   state == fhs_sighting_state) {
				maxScore = Math.max(fhs_grid_scores[i][j], maxScore);
			}
		}
	}
	var suggested = [];
	if (maxScore != 0) {
		for (var i = 0; i < 6; i++) {
			for (var j = 0; j < 6; j++) {
				var numStr = IndexFormat(j + 6 * i);
				var cell = document.getElementById("cell" + numStr);
				var state = cell.getAttribute("data-state");
				var isMax = fhs_grid_scores[i][j] == maxScore;
				if (isMax && state == fhs_empty_state) {
					cell.setAttribute("data-state", fhs_prediction_state);
					UpdateCell(cell);
					suggested.push([i, j]);
				} else if (isMax && state == fhs_verified_state) {
					cell.setAttribute("data-state", fhs_prediction_verified_state);
					UpdateCell(cell);
					suggested.push([i, j]);
				} else if (isMax && state == fhs_sighting_state) {
					cell.setAttribute("data-state", fhs_prediction_sighting_state);
					UpdateCell(cell);
					suggested.push([i, j]);
				}
			}
		}
	}
	var live = document.getElementById("prediction-live");
	if (live) {
		if (suggested.length) {
			var parts = suggested.map(function(p) {
				return "row " + (p[0] + 1) + ", column " + (p[1] + 1);
			});
			live.textContent = "Suggested flip: " + parts.join("; ");
		} else {
			live.textContent = "No suggestion";
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
outerloop:
			for (var i = 0; i < 6; i++) {
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
	var positions = [0,0,0,0,0];
	var ind = 0;
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (fhs_grid[i][j] == 1 && ind < 5) {
				positions[ind++] = i*6 + j;
			} else if (ind > 5) {
				return -1;
			}
		}
	}
	var exists = fhs_sheet_patterns.some(row => JSON.stringify(row) === JSON.stringify(positions));
	if (exists) {
		var match = true;
		for (var i = 0; i < fhs_sheet_patterns.length; i++) {
innerloop:
			for (var j = 0; j < 5; j++) {
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
				UpdateCell(cell);
			}
		}
	}
	
}

function runGuaranteed() {
	ParseGrid();

	for(var i = 0; i < 2; i++) {
		MarkGuaranteedBlocks();
	}

	var lookingForFox = document.getElementById("lookforfox").checked;
	window.fhs_grid_scores = lookingForFox
		? weightedScores(CalculateFullProb())
		: weightedWFScores(CalculateProbWithoutFox());
	UpdateScoresInCells();
	ClearPredictionsAndSightings();
	UpdatePrediction();
	UpdateSightings();
}


function GetFlipsRemaining() {
	return fhs_flip_budget - window.fhs_flips_used;
}

// Swords is a 2x3 block (6 cells), coffer is 2x2 (4 cells); once found, the
// rest of the shape is still hidden but its position is narrowed by
// NaiiveLargeProb/NaiiveMedProb rather than by this count.
function MinFlipsToCompleteSwords() {
	var hitCount = 0;
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (window.fhs_grid[i][j] == 4) hitCount++;
		}
	}
	return 6 - hitCount;
}

function MinFlipsToCompleteCoffer() {
	var hitCount = 0;
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			if (window.fhs_grid[i][j] == 3) hitCount++;
		}
	}
	return 4 - hitCount;
}

// A shape that can't be completed with the flips left is worth 0: zeroing its
// weight here lets weightedScores/weightedWFScores reallocate to reachable targets.
function GetChestWeight() {
	var base = Number(document.getElementById("boxweight").value);
	return MinFlipsToCompleteCoffer() > GetFlipsRemaining() ? 0 : base;
}

function GetSwordsWeight() {
	var base = Number(document.getElementById("swordweight").value);
	return MinFlipsToCompleteSwords() > GetFlipsRemaining() ? 0 : base;
}

function GetFoxWeight() {
	return Number(document.getElementById("foxweight").value);
}

function weightedScores(probs) {
	var newScores = PrefillArray();
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			var foxWeighted = probs[0][i][j] * GetFoxWeight();
			var boxWeighted = probs[1][i][j] * GetChestWeight();
			var swordsWeighted = probs[2][i][j] * GetSwordsWeight();
			newScores[i][j] = foxWeighted + boxWeighted + swordsWeighted;
		}
	}
	return newScores;
}

function weightedWFScores(probs) {
	var newScores = PrefillArray();
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 6; j++) {
			var boxWeighted = probs[0][i][j] * GetChestWeight();
			var swordsWeighted = probs[1][i][j] * GetSwordsWeight();
			newScores[i][j] = boxWeighted + swordsWeighted;
		}
	}
	return newScores;
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
				if (hitLoc[0] - (1 - i) < 0 || hitLoc[0] + i > 5 ||
					hitLoc[1] - (2 - j) < 0 || hitLoc[1] + j > 5) {
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
				if (hitLoc[0] - (2 - i) < 0 || hitLoc[0] + i > 5 ||
					hitLoc[1] - (1 - j) < 0 || hitLoc[1] + j > 5) {
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
			if (block1 != 0 ||
				block2 != 0 ||
				block3 != 0 ||
				block4 != 0 ||
				block5 != 0 ||
				block6 != 0) {
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
			if (block1 != 0 ||
				block2 != 0 ||
				block3 != 0 ||
				block4 != 0 ||
				block5 != 0 ||
				block6 != 0) {
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
				if (hitLoc[0] + i < 0 || hitLoc[0] + 1 + i > 5 ||
					hitLoc[1] + j < 0 || hitLoc[1] + 1 + j > 5) {
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
				if (window.fhs_grid[i][j] != 0 || window.fhs_grid[i][j + 1] != 0 ||
					window.fhs_grid[i + 1][j] != 0 || window.fhs_grid[i + 1][j + 1] != 0) {
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
	var hitMap = new Array(6).fill(0).map(
		() => new Array(6).fill(0).map(
			() => new Array(3).fill(0)
		)
	);
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
			if ((window.fhs_grid[iSm][jSm] == 0 && currentHits[0] == 0) ||
				(window.fhs_grid[iSm][jSm] == 5 && currentHits[0] != 0)) {

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

						if (medTotalInPlacement == currentHits[1] &&
							(medBlocks[0] == 0 || medBlocks[0] == 3) &&
							(medBlocks[1] == 0 || medBlocks[1] == 3) &&
							(medBlocks[2] == 0 || medBlocks[2] == 3) &&
							(medBlocks[3] == 0 || medBlocks[3] == 3)) {

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

									if (largeTotalInPlacement == currentHits[2] &&
										(largeBlocks[0] == 0 || largeBlocks[0] == 4) &&
										(largeBlocks[1] == 0 || largeBlocks[1] == 4) &&
										(largeBlocks[2] == 0 || largeBlocks[2] == 4) &&
										(largeBlocks[3] == 0 || largeBlocks[3] == 4) &&
										(largeBlocks[4] == 0 || largeBlocks[4] == 4) &&
										(largeBlocks[5] == 0 || largeBlocks[5] == 4)) {

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

									if (largeTotalInPlacement == currentHits[2] &&
										(largeBlocks[0] == 0 || largeBlocks[0] == 4) &&
										(largeBlocks[1] == 0 || largeBlocks[1] == 4) &&
										(largeBlocks[2] == 0 || largeBlocks[2] == 4) &&
										(largeBlocks[3] == 0 || largeBlocks[3] == 4) &&
										(largeBlocks[4] == 0 || largeBlocks[4] == 4) &&
										(largeBlocks[5] == 0 || largeBlocks[5] == 4)) {
	
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
	var probabilityMaps = [
		PrefillArray(),
		PrefillArray(),
		PrefillArray()
	];

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
	var hitMap = new Array(6).fill(0).map(
		() => new Array(6).fill(0).map(
			() => new Array(2).fill(0)
		)
	);
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

			if (medTotalInPlacement == currentHits[0] &&
			   (medBlocks[0] == 0 || medBlocks[0] == 3) &&
			   (medBlocks[1] == 0 || medBlocks[1] == 3) &&
			   (medBlocks[2] == 0 || medBlocks[2] == 3) &&
			   (medBlocks[3] == 0 || medBlocks[3] == 3)) {

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

						if (largeTotalInPlacement == currentHits[1] &&
						   (largeBlocks[0] == 0 || largeBlocks[0] == 4) &&
						   (largeBlocks[1] == 0 || largeBlocks[1] == 4) &&
						   (largeBlocks[2] == 0 || largeBlocks[2] == 4) &&
						   (largeBlocks[3] == 0 || largeBlocks[3] == 4) &&
						   (largeBlocks[4] == 0 || largeBlocks[4] == 4) &&
						   (largeBlocks[5] == 0 || largeBlocks[5] == 4)) {

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
				}// End Horizontal Larges

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

						if (largeTotalInPlacement == currentHits[1] &&
						   (largeBlocks[0] == 0 || largeBlocks[0] == 4) &&
						   (largeBlocks[1] == 0 || largeBlocks[1] == 4) &&
						   (largeBlocks[2] == 0 || largeBlocks[2] == 4) &&
						   (largeBlocks[3] == 0 || largeBlocks[3] == 4) &&
						   (largeBlocks[4] == 0 || largeBlocks[4] == 4) &&
						   (largeBlocks[5] == 0 || largeBlocks[5] == 4)) {
	
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
				}// End Vertical Larges
			}
		}
	} // End Mediums

	// Probabilities Time

	//LARGE HIT COUNT IS THE SAME AS TOTAL BOARD CONFIGS
	//Formula: number of hits/total board configs
	var probabilityMaps = [
		PrefillArray(),
		PrefillArray()
	];

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
	UpdateCoffer();
}
StartUp();