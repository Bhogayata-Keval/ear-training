var LEVELS_KEY = "ear-training-levels";
var currentLevel = null;
var LEVEL_UNLOCK_THRESHOLD = 0.8;
var LEVEL_MIN_ANSWERS = 10;

var LEVEL_DEFS = [
  {
    id: 1,
    name: "Natural Notes",
    description: "Identify white keys in one octave",
    mode: "test",
    notes: ["c4", "d4", "e4", "f4", "g4", "a4", "b4"],
    free: true
  },
  {
    id: 2,
    name: "Chromatic Scale",
    description: "All 12 notes in one octave",
    mode: "test",
    notes: ["c4", "c-4", "d4", "d-4", "e4", "f4", "f-4", "g4", "g-4", "a4", "a-4", "b4"],
    free: true
  },
  {
    id: 3,
    name: "Easy Intervals",
    description: "Perfect 5th & Octave",
    mode: "intervals",
    intervals: [7, 12],
    free: true
  },
  {
    id: 4,
    name: "Two Octaves",
    description: "Notes across two octaves",
    mode: "test",
    notes: [
      "c4", "c-4", "d4", "d-4", "e4", "f4", "f-4", "g4", "g-4", "a4", "a-4", "b4",
      "c5", "c-5", "d5", "d-5", "e5", "f5", "f-5", "g5", "g-5", "a5", "a-5", "b5"
    ],
    free: false
  },
  {
    id: 5,
    name: "All Intervals",
    description: "All 12 intervals ascending",
    mode: "intervals",
    intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    direction: "ascending",
    free: false
  },
  {
    id: 6,
    name: "Descending",
    description: "All intervals descending",
    mode: "intervals",
    intervals: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    direction: "descending",
    free: false
  },
  {
    id: 7,
    name: "Chords",
    description: "Coming soon",
    mode: null,
    free: false,
    comingSoon: true
  }
];

function defaultLevelStats() {
  return { correct: 0, total: 0, streak: 0, history: [] };
}

function loadLevelStats() {
  try {
    var raw = localStorage.getItem(LEVELS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveLevelStats(stats) {
  try {
    localStorage.setItem(LEVELS_KEY, JSON.stringify(stats));
  } catch (e) {}
}

function getLevelStats(levelId) {
  var stats = loadLevelStats();
  return stats[levelId] || defaultLevelStats();
}

function recordLevelAnswer(levelId, answer, guess, isCorrect) {
  var stats = loadLevelStats();
  if (!stats[levelId]) stats[levelId] = defaultLevelStats();
  var m = stats[levelId];
  m.total++;
  if (isCorrect) {
    m.correct++;
    m.streak++;
  } else {
    m.streak = 0;
  }
  m.history.unshift({
    time: new Date().toISOString(),
    answer: answer,
    guess: guess,
    correct: isCorrect
  });
  if (m.history.length > 20) m.history = m.history.slice(0, 20);
  saveLevelStats(stats);
  checkLevelUnlock(levelId);
  return m;
}

function resetLevelStats(levelId) {
  var stats = loadLevelStats();
  stats[levelId] = defaultLevelStats();
  saveLevelStats(stats);
}

function checkLevelUnlock(levelId) {
  var stats = getLevelStats(levelId);
  if (stats.total < LEVEL_MIN_ANSWERS) return;
  if ((stats.correct / stats.total) < LEVEL_UNLOCK_THRESHOLD) return;

  var nextDef = LEVEL_DEFS.find(function(d) { return d.id === levelId + 1; });
  if (!nextDef || !nextDef.free || nextDef.comingSoon) return;

  var allStats = loadLevelStats();
  var shownKey = "unlocked_shown_" + nextDef.id;
  if (allStats[shownKey]) return;
  allStats[shownKey] = true;
  saveLevelStats(allStats);

  showUnlockToast(nextDef);
  renderSidebar();
}

function showUnlockToast(levelDef) {
  var toast = document.createElement("div");
  toast.className = "level-unlock-toast";
  toast.innerHTML = "<strong>Level " + levelDef.id + " Unlocked!</strong><br>" + levelDef.name;
  document.body.appendChild(toast);
  setTimeout(function() { toast.classList.add("show"); }, 50);
  setTimeout(function() {
    toast.classList.remove("show");
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

var cheatMode = false;

function unlockAllLevels() {
  cheatMode = true;
  renderSidebar();
  console.log("All levels unlocked. Use selectLevel(N) to jump to any level.");
}

function isLevelUnlocked(levelId) {
  var def = LEVEL_DEFS.find(function(d) { return d.id === levelId; });
  if (!def) return false;
  if (def.comingSoon) return false;
  if (cheatMode) return true;
  if (!def.free) return isPremium;
  if (levelId === 1) return true;
  var prevStats = getLevelStats(levelId - 1);
  if (prevStats.total < LEVEL_MIN_ANSWERS) return false;
  return (prevStats.correct / prevStats.total) >= LEVEL_UNLOCK_THRESHOLD;
}

function getLevelStatus(levelId) {
  var def = LEVEL_DEFS.find(function(d) { return d.id === levelId; });
  if (!def) return "locked";
  if (def.comingSoon) return "coming-soon";
  if (!def.free && !isPremium) return "paid";
  if (!isLevelUnlocked(levelId)) return "locked";
  var stats = getLevelStats(levelId);
  if (stats.total >= LEVEL_MIN_ANSWERS && (stats.correct / stats.total) >= LEVEL_UNLOCK_THRESHOLD) return "completed";
  return "unlocked";
}

function selectLevel(levelId) {
  var def = LEVEL_DEFS.find(function(d) { return d.id === levelId; });
  if (!def || def.comingSoon || !isLevelUnlocked(levelId)) return;
  currentLevel = def;
  applyLevel(def);
  renderSidebar();
}

function exitLevel() {
  currentLevel = null;
  selectedNotes = new Set(DEFAULT_SELECTED_NOTES);
  selectedIntervals = new Set(INTERVALS.map(function(i) { return i.semitones; }));

  document.querySelector('.mode-button[data-mode="play"]').style.display = "";
  document.querySelector('.mode-button[data-mode="ear-training"]').disabled = false;
  document.getElementById("ear-training-submodes").style.display = "";

  var dirSelect = document.getElementById("interval-direction");
  if (dirSelect) {
    dirSelect.value = "ascending";
    dirSelect.disabled = false;
  }

  document.querySelectorAll(".interval-toggle").forEach(function(btn) {
    btn.classList.remove("level-disabled");
  });
  document.querySelectorAll("#note-list .key").forEach(function(key) {
    key.classList.remove("level-disabled");
  });

  showNoteList();
  setMode("test");
  renderSidebar();
}

function applyLevel(def) {
  if (def.mode === "test" && def.notes) {
    selectedNotes = new Set(def.notes);
    AUDIO_CLIPS = Array.from(selectedNotes);
  }
  if (def.mode === "intervals" && def.intervals) {
    selectedIntervals = new Set(def.intervals);
  }

  if (def.direction) {
    var dirSelect = document.getElementById("interval-direction");
    if (dirSelect) {
      dirSelect.value = def.direction;
      dirSelect.disabled = true;
    }
  } else {
    var dirSelect = document.getElementById("interval-direction");
    if (dirSelect) dirSelect.disabled = false;
  }

  setMode(def.mode);

  // Update key visuals for test mode — disable non-level keys
  document.querySelectorAll("#note-list .key").forEach(function(key) {
    var inLevel = def.mode === "test" && selectedNotes.has(key.dataset.note);
    key.classList.toggle("selected", inLevel);
    key.classList.toggle("level-disabled", !inLevel);
  });

  // Update interval toggle visuals — disable non-level intervals
  document.querySelectorAll(".interval-toggle").forEach(function(btn) {
    var semitones = parseInt(btn.dataset.semitones, 10);
    var inLevel = def.mode === "intervals" && selectedIntervals.has(semitones);
    btn.classList.toggle("selected", inLevel);
    btn.classList.toggle("level-disabled", !inLevel);
  });

  // Hide select all / deselect all buttons in level mode
  var noteControls = document.querySelector("#note-list .keyboard-controls");
  if (noteControls) noteControls.style.display = "none";

  var intervalSelector = document.getElementById("interval-selector");
  if (intervalSelector) {
    var intervalControls = intervalSelector.querySelector(".keyboard-controls");
    if (intervalControls) intervalControls.style.display = "none";
  }

  document.querySelector('.mode-button[data-mode="play"]').style.display = "none";
  document.querySelector('.mode-button[data-mode="ear-training"]').disabled = true;
  document.getElementById("ear-training-submodes").style.display = "none";

  lastAnswer = "";
  lastIntervalAnswer = null;
  lastIntervalNotes = null;
  answerChecked = false;
  var answerDisplay = document.getElementById("answer-display");
  if (answerDisplay) answerDisplay.textContent = "";

  renderStats();
}

function toggleSidebar() {
  var sidebar = document.getElementById("level-sidebar");
  if (!sidebar) return;
  sidebar.classList.toggle("collapsed");
  var btn = sidebar.querySelector(".sidebar-toggle");
  if (btn) {
    btn.textContent = sidebar.classList.contains("collapsed") ? "▶" : "◀";
  }
}

function renderSidebar() {
  var container = document.querySelector(".sidebar-levels");
  if (!container) return;
  container.innerHTML = "";

  LEVEL_DEFS.forEach(function(def) {
    var status = getLevelStatus(def.id);
    var isActive = currentLevel && currentLevel.id === def.id;

    if (def.id === 1) {
      var label = document.createElement("div");
      label.className = "sidebar-section-label";
      label.textContent = "FREE";
      container.appendChild(label);
    }
    if (def.id === 4) {
      var divider = document.createElement("div");
      divider.className = "sidebar-divider";
      container.appendChild(divider);
      var label = document.createElement("div");
      label.className = "sidebar-section-label";
      label.textContent = "PREMIUM";
      container.appendChild(label);
    }

    var item = document.createElement("div");
    item.className = "level-item level-" + status + (isActive ? " active" : "");

    var header = document.createElement("div");
    header.className = "level-item-header";

    var icon = document.createElement("span");
    icon.className = "level-icon";
    if (status === "completed") {
      icon.textContent = "✓";
    } else {
      icon.textContent = String(def.id);
    }

    var info = document.createElement("div");
    info.className = "level-info";
    var nameEl = document.createElement("span");
    nameEl.className = "level-name";
    nameEl.textContent = def.name;
    var descEl = document.createElement("span");
    descEl.className = "level-desc";
    descEl.textContent = def.description;
    info.appendChild(nameEl);
    info.appendChild(descEl);

    header.appendChild(icon);
    header.appendChild(info);

    if (status === "paid") {
      var badge = document.createElement("span");
      badge.className = "level-badge";
      badge.textContent = "Premium";
      header.appendChild(badge);
    }
    if (status === "coming-soon") {
      var badge = document.createElement("span");
      badge.className = "level-badge coming-soon";
      badge.textContent = "Soon";
      header.appendChild(badge);
    }

    item.appendChild(header);

    if (status === "unlocked" || status === "completed") {
      var stats = getLevelStats(def.id);
      if (stats.total > 0) {
        var pct = Math.round((stats.correct / stats.total) * 100);
        var progressWrap = document.createElement("div");
        progressWrap.className = "level-progress-wrap";
        var pctLabel = document.createElement("span");
        pctLabel.className = "level-pct";
        pctLabel.textContent = pct + "%";
        var progressTrack = document.createElement("div");
        progressTrack.className = "level-progress";
        var progressBar = document.createElement("div");
        progressBar.className = "level-progress-bar" + (status === "completed" ? " completed" : "");
        progressBar.style.width = Math.min(pct, 100) + "%";
        progressTrack.appendChild(progressBar);
        progressWrap.appendChild(pctLabel);
        progressWrap.appendChild(progressTrack);
        item.appendChild(progressWrap);
      }
      item.style.cursor = "pointer";
      item.addEventListener("click", (function(id) {
        return function() { selectLevel(id); };
      })(def.id));
    } else if (status === "paid") {
      item.style.cursor = "pointer";
      item.addEventListener("click", (function(id) {
        return function() { showPremiumModal(id); };
      })(def.id));
    } else if (status === "locked") {
      item.style.opacity = "0.5";
    }

    container.appendChild(item);
  });

  var divider = document.createElement("div");
  divider.className = "sidebar-divider";
  container.appendChild(divider);

  var freeItem = document.createElement("div");
  freeItem.className = "level-item level-free" + (!currentLevel ? " active" : "");
  freeItem.style.cursor = "pointer";
  var freeHeader = document.createElement("div");
  freeHeader.className = "level-item-header";
  var freeIcon = document.createElement("span");
  freeIcon.className = "level-icon free-icon";
  freeIcon.textContent = "♪";
  var freeInfo = document.createElement("div");
  freeInfo.className = "level-info";
  var freeName = document.createElement("span");
  freeName.className = "level-name";
  freeName.textContent = "Free Practice";
  var freeDesc = document.createElement("span");
  freeDesc.className = "level-desc";
  freeDesc.textContent = "Unrestricted mode";
  freeInfo.appendChild(freeName);
  freeInfo.appendChild(freeDesc);
  freeHeader.appendChild(freeIcon);
  freeHeader.appendChild(freeInfo);
  freeItem.appendChild(freeHeader);
  freeItem.addEventListener("click", function() { exitLevel(); });
  container.appendChild(freeItem);
}

function initSidebar() {
  renderSidebar();
  if (window.innerWidth < 720) {
    var sidebar = document.getElementById("level-sidebar");
    if (sidebar) sidebar.classList.add("collapsed");
    var btn = document.querySelector(".sidebar-toggle");
    if (btn) btn.textContent = "▶";
  }
}
