var KEY_ORDER = ['c','c-','d','d-','e','f','f-','g','g-','a','a-','b'];
var WHITE_BASE_ORDER = ['c','d','e','f','g','a','b'];
var WHITE_INDEX = WHITE_BASE_ORDER.reduce(function (map, base, idx) {
  map[base] = idx;
  return map;
}, {});
var WHITE_KEY_WIDTH = 56;
var WHITE_KEY_GAP = 4;
var STEP = WHITE_KEY_WIDTH + WHITE_KEY_GAP;
var BLACK_KEY_WIDTH = 36;
var PREVIOUS_WHITE = {
  c: 'b', d: 'c', e: 'd', f: 'e', g: 'f', a: 'g', b: 'a'
};
var DEFAULT_SELECTED_NOTES = ["c4", "d4", "e4", "f4", "g4", "a4", "b4"];
var selectedNotes = new Set(DEFAULT_SELECTED_NOTES);
var AUDIO_CLIPS = Array.from(selectedNotes);
var isPlaying = false;
var activeMode = "test";
var earTrainingSubMode = "test";
var lastAnswer = "";
var lastIntervalAnswer = null;
var lastIntervalNotes = null;
var answerChecked = false;
var selectedIntervals = new Set(INTERVALS.map(function (i) { return i.semitones; }));

function formatLabel(note) {
  var match = note.match(/^([a-g])(-?)(\d+)$/i);
  if (!match) return note.toUpperCase();
  var letter = match[1].toUpperCase();
  var accidental = match[2] === "-" ? "b" : "";
  var octave = match[3];
  return letter + accidental + octave;
}

function refreshPlayButtonState() {
  var button = document.getElementById("play-random");
  if (!button) return;
  var disabled = isPlaying || (activeMode !== "test" && activeMode !== "intervals");
  button.disabled = disabled;
  button.classList.toggle("disabled", disabled);
  refreshPlayAgainButtonState();
}

function refreshPlayAgainButtonState() {
  var button = document.getElementById("play-again");
  if (!button) return;
  var hasAnswer = activeMode === "intervals" ? !!lastIntervalNotes : !!lastAnswer;
  var disabled = !hasAnswer || isPlaying || (activeMode !== "test" && activeMode !== "intervals") || !soundsReady;
  button.disabled = disabled;
  button.classList.toggle("disabled", disabled);
}

function setMode(mode) {
  activeMode = mode;
  var isEarTraining = mode === "test" || mode === "intervals";

  if (isEarTraining) earTrainingSubMode = mode;

  document.querySelectorAll(".mode-button").forEach(function (btn) {
    if (btn.dataset.mode === "play") {
      btn.classList.toggle("active", mode === "play");
    } else if (btn.dataset.mode === "ear-training") {
      btn.classList.toggle("active", isEarTraining);
    }
  });

  var submodes = document.getElementById("ear-training-submodes");
  if (submodes) {
    submodes.style.display = isEarTraining ? "" : "none";
    submodes.querySelectorAll(".submode-button").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.submode === mode);
    });
  }

  var instruction = document.getElementById("mode-instruction");
  if (instruction) {
    if (mode === "play") {
      instruction.textContent = "Play mode: Tap any key to hear its sound.";
    } else if (mode === "intervals") {
      instruction.textContent = "Interval training: identify the interval between two notes.";
    } else {
      instruction.textContent = "Test mode: play a random note, guess it, and check the answer.";
    }
  }

  var playBtn = document.getElementById("play-random");
  if (playBtn) {
    playBtn.textContent = mode === "intervals" ? "Play an Interval" : "Play a Random Note";
  }

  var guessLabel = document.getElementById("guess-label");
  if (guessLabel) {
    guessLabel.textContent = mode === "intervals" ? "Guess the interval" : "Guess the note";
  }

  var controlsRow = document.getElementById("controls-row");
  if (controlsRow) {
    controlsRow.style.display = mode === "play" ? "none" : "";
  }

  var keyboardControls = document.querySelector(".keyboard-controls");
  if (keyboardControls) {
    keyboardControls.style.display = mode === "test" ? "" : "none";
  }

  document.querySelectorAll("#note-list .key").forEach(function (key) {
    key.classList.toggle("selected", mode === "test" && selectedNotes.has(key.dataset.note));
  });

  var intervalSelector = document.getElementById("interval-selector");
  if (intervalSelector) {
    intervalSelector.style.display = mode === "intervals" ? "" : "none";
  }

  var refControls = document.getElementById("reference-controls");
  if (refControls) {
    refControls.style.display = mode === "intervals" ? "none" : "";
  }

  var dirGroup = document.getElementById("interval-direction-group");
  if (dirGroup) {
    dirGroup.style.display = mode === "intervals" ? "" : "none";
  }

  var repeatLabel = document.querySelector('label[for="repeat-count"]');
  if (repeatLabel) {
    repeatLabel.textContent = mode === "intervals"
      ? "How many times to repeat the interval?"
      : "How many times should the note be played?";
  }

  var answerDisplay = document.getElementById("answer-display");
  if (answerDisplay) answerDisplay.textContent = "";

  refreshPlayButtonState();
  updateGuessOptions();
  renderStats();

  var guessSelect = document.getElementById("guess-select");
  if (guessSelect) {
    guessSelect.disabled = !isEarTraining || !soundsReady;
  }
}

function playNoteImmediate(noteId) {
  if (!soundsReady) {
    updateSoundStatus("Waiting for sounds to load...");
    return;
  }
  playBuffer(noteId);
}

function handleKeyInteraction(noteId, button) {
  if (activeMode === "intervals") return;
  if (activeMode === "play") {
    playNoteImmediate(noteId);
    return;
  }
  toggleKey(noteId, button);
}

function playSequence(note) {
  var repeatInput = parseInt(document.getElementById("repeat-count").value, 10);
  var gapInput = parseFloat(document.getElementById("gap-among-notes").value);
  var count = Number.isFinite(repeatInput) && repeatInput > 0 ? repeatInput : 1;
  var gap = Number.isFinite(gapInput) && gapInput > 0 ? gapInput : 1;

  var referenceToggle = document.getElementById("reference-note-toggle");
  var referenceSelect = document.getElementById("reference-note-select");
  var referenceEnabled = referenceToggle ? referenceToggle.checked : false;
  var referenceNote = referenceSelect ? referenceSelect.value : "";

  isPlaying = true;
  refreshPlayButtonState();

  if (referenceEnabled && referenceNote) {
    playBuffer(referenceNote);
  }

  var startDelay = referenceEnabled ? 1000 * gap : 0;
  for (var i = 0; i < count; i++) {
    setTimeout(function (n) {
      playBuffer(n);
    }, startDelay + i * 1000 * gap, note);
  }

  var totalDuration = startDelay + count * 1000 * gap;
  setTimeout(function () {
    isPlaying = false;
    refreshPlayButtonState();
  }, totalDuration);
}

function playIntervalSequence(note1, note2) {
  var repeatInput = parseInt(document.getElementById("repeat-count").value, 10);
  var gapInput = parseFloat(document.getElementById("gap-among-notes").value);
  var count = Number.isFinite(repeatInput) && repeatInput > 0 ? repeatInput : 1;
  var gap = Number.isFinite(gapInput) && gapInput > 0 ? gapInput : 1;

  isPlaying = true;
  refreshPlayButtonState();

  for (var i = 0; i < count; i++) {
    var pairStart = i * 2 * 1000 * gap;
    setTimeout(function (n) { playBuffer(n); }, pairStart, note1);
    setTimeout(function (n) { playBuffer(n); }, pairStart + 1000 * gap, note2);
  }

  var totalDuration = count * 2 * 1000 * gap;
  setTimeout(function () {
    isPlaying = false;
    refreshPlayButtonState();
  }, totalDuration);
}

function playRandom() {
  if (activeMode === "intervals") {
    playRandomInterval();
  } else {
    playRandomNote();
  }
}

function playRandomInterval() {
  var answerDisplay = document.getElementById("answer-display");
  answerDisplay.textContent = "";

  if (activeMode !== "intervals") return;

  if (!soundsReady) {
    updateSoundStatus("Loading sounds, please wait...");
    return;
  }
  if (isPlaying) {
    answerDisplay.textContent = "Wait for the current sequence to finish.";
    return;
  }

  var enabledIntervals = INTERVALS.filter(function (i) { return selectedIntervals.has(i.semitones); });
  if (!enabledIntervals.length) {
    answerDisplay.textContent = "Select at least one interval.";
    return;
  }

  var interval = enabledIntervals[Math.floor(Math.random() * enabledIntervals.length)];

  var availableSet = new Set(ALL_AUDIO_CLIPS);
  var validRoots = ALL_AUDIO_CLIPS.filter(function (note) {
    var s = noteToSemitone(note);
    if (s === null) return false;
    var target = semitoneToNote(s + interval.semitones);
    return target && availableSet.has(target);
  });

  if (!validRoots.length) {
    answerDisplay.textContent = "No valid notes available for this interval.";
    return;
  }

  var rootNote = validRoots[Math.floor(Math.random() * validRoots.length)];
  var targetNote = semitoneToNote(noteToSemitone(rootNote) + interval.semitones);

  var dirSelect = document.getElementById("interval-direction");
  var direction = dirSelect ? dirSelect.value : "ascending";
  if (direction === "random") {
    direction = Math.random() < 0.5 ? "ascending" : "descending";
  }

  var firstNote, secondNote;
  if (direction === "descending") {
    firstNote = targetNote;
    secondNote = rootNote;
  } else {
    firstNote = rootNote;
    secondNote = targetNote;
  }

  lastIntervalAnswer = interval;
  lastIntervalNotes = [firstNote, secondNote];
  answerChecked = false;
  enableCheckButton();
  refreshPlayAgainButtonState();
  playIntervalSequence(firstNote, secondNote);
}

function playExistingSequence() {
  var answerDisplay = document.getElementById("answer-display");
  if (activeMode !== "test" && activeMode !== "intervals") {
    answerDisplay.textContent = "Switch to test or interval mode.";
    return;
  }
  if (!soundsReady) {
    updateSoundStatus("Loading sounds, please wait...");
    return;
  }
  if (isPlaying) {
    answerDisplay.textContent = "Wait for the current sequence to finish.";
    return;
  }

  if (activeMode === "intervals") {
    if (!lastIntervalNotes) {
      answerDisplay.textContent = "Play an interval first.";
      return;
    }
    playIntervalSequence(lastIntervalNotes[0], lastIntervalNotes[1]);
  } else {
    if (!lastAnswer) {
      answerDisplay.textContent = "Play a random note first.";
      return;
    }
    playSequence(lastAnswer);
  }
}

function populateReferenceSelect() {
  var select = document.getElementById("reference-note-select");
  if (!select) return;
  select.innerHTML = "";
  ALL_AUDIO_CLIPS.forEach(function (note) {
    var option = document.createElement("option");
    option.value = note;
    option.textContent = formatLabel(note);
    select.appendChild(option);
  });
  select.value = "c4";
}

function createKey(noteId, isBlack) {
  var key = document.createElement("button");
  key.type = "button";
  key.className = "key " + (isBlack ? "black-key" : "white-key") + (selectedNotes.has(noteId) ? " selected" : "");
  key.dataset.note = noteId;
  key.textContent = formatLabel(noteId);
  key.addEventListener("click", function () {
    handleKeyInteraction(noteId, key);
  });
  return key;
}

function showNoteList() {
  var container = document.getElementById("note-list");
  container.innerHTML = "";

  populateReferenceSelect();

  var keyboard = document.createElement("div");
  keyboard.className = "keyboard";

  var octaves = [];
  var seen = {};
  ALL_AUDIO_CLIPS.forEach(function (note) {
    var match = note.match(/\d+/);
    if (match && !seen[match[0]]) {
      seen[match[0]] = true;
      octaves.push(match[0]);
    }
  });
  octaves.sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); });

  var availableNotes = new Set(ALL_AUDIO_CLIPS);
  octaves.forEach(function (octave) {
    var octaveBlock = document.createElement("div");
    octaveBlock.className = "octave";

    var whiteRow = document.createElement("div");
    whiteRow.className = "white-row";

    var blackRow = document.createElement("div");
    blackRow.className = "black-row";

    KEY_ORDER.forEach(function (base) {
      var noteId = base + octave;
      if (!availableNotes.has(noteId)) return;

      var isBlack = base.includes("-");
      var key = createKey(noteId, isBlack);

      if (isBlack) {
        var baseWithoutDash = base.replace("-", "");
        var preceding = PREVIOUS_WHITE[baseWithoutDash];
        var baseIndex = preceding ? WHITE_INDEX[preceding] : null;
        if (baseIndex == null) return;
        var left = baseIndex * STEP + WHITE_KEY_WIDTH + (WHITE_KEY_GAP / 2) - (BLACK_KEY_WIDTH / 2);
        key.style.left = left + "px";
        blackRow.appendChild(key);
      } else {
        whiteRow.appendChild(key);
      }
    });

    octaveBlock.appendChild(whiteRow);
    octaveBlock.appendChild(blackRow);
    keyboard.appendChild(octaveBlock);
  });

  container.appendChild(keyboard);

  var controls = document.createElement("div");
  controls.className = "keyboard-controls";
  var deselect = document.createElement("button");
  deselect.type = "button";
  deselect.textContent = "Deselect All";
  deselect.addEventListener("click", function () { updateAll(false); });
  var selectBtn = document.createElement("button");
  selectBtn.type = "button";
  selectBtn.textContent = "Select All";
  selectBtn.addEventListener("click", function () { updateAll(true); });
  controls.appendChild(deselect);
  controls.appendChild(selectBtn);
  container.appendChild(controls);

  updateSelectedList();
  showIntervalSelector();
  setMode(activeMode);
}

function showIntervalSelector() {
  var container = document.getElementById("interval-selector");
  if (!container) return;
  container.innerHTML = "";

  var buttons = document.createElement("div");
  buttons.className = "interval-buttons";

  INTERVALS.forEach(function (interval) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "interval-toggle" + (selectedIntervals.has(interval.semitones) ? " selected" : "");
    btn.textContent = interval.name;
    btn.dataset.semitones = interval.semitones;
    btn.addEventListener("click", function () {
      if (selectedIntervals.has(interval.semitones)) {
        selectedIntervals.delete(interval.semitones);
        btn.classList.remove("selected");
      } else {
        selectedIntervals.add(interval.semitones);
        btn.classList.add("selected");
      }
      updateGuessOptions();
    });
    buttons.appendChild(btn);
  });

  container.appendChild(buttons);

  var controls = document.createElement("div");
  controls.className = "keyboard-controls";
  var deselect = document.createElement("button");
  deselect.type = "button";
  deselect.textContent = "Deselect All";
  deselect.addEventListener("click", function () {
    selectedIntervals.clear();
    container.querySelectorAll(".interval-toggle").forEach(function (b) { b.classList.remove("selected"); });
    updateGuessOptions();
  });
  var selectAll = document.createElement("button");
  selectAll.type = "button";
  selectAll.textContent = "Select All";
  selectAll.addEventListener("click", function () {
    INTERVALS.forEach(function (i) { selectedIntervals.add(i.semitones); });
    container.querySelectorAll(".interval-toggle").forEach(function (b) { b.classList.add("selected"); });
    updateGuessOptions();
  });
  controls.appendChild(deselect);
  controls.appendChild(selectAll);
  container.appendChild(controls);
}

function toggleKey(note, button) {
  if (selectedNotes.has(note)) {
    selectedNotes.delete(note);
    button.classList.remove("selected");
  } else {
    selectedNotes.add(note);
    button.classList.add("selected");
  }
  updateSelectedList();
}

function updateAll(shouldSelect) {
  selectedNotes.clear();
  document.querySelectorAll("#note-list .key").forEach(function (key) {
    if (shouldSelect) {
      selectedNotes.add(key.dataset.note);
      key.classList.add("selected");
    } else {
      key.classList.remove("selected");
    }
  });
  updateSelectedList();
}

function updateSelectedList() {
  AUDIO_CLIPS = Array.from(selectedNotes);
  updateGuessOptions();
}

function updateGuessOptions() {
  var select = document.getElementById("guess-select");
  if (!select) return;
  select.innerHTML = "";

  if (activeMode === "intervals") {
    var enabled = INTERVALS.filter(function (i) { return selectedIntervals.has(i.semitones); });
    if (!enabled.length) {
      var none = document.createElement("option");
      none.value = "";
      none.textContent = "No intervals selected";
      none.disabled = true;
      none.selected = true;
      select.appendChild(none);
      select.disabled = true;
      return;
    }
    select.disabled = !soundsReady;
    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select an interval";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);
    enabled.forEach(function (interval) {
      var option = document.createElement("option");
      option.value = interval.name;
      option.textContent = interval.name;
      select.appendChild(option);
    });
    return;
  }

  if (!AUDIO_CLIPS.length) {
    var option = document.createElement("option");
    option.value = "";
    option.textContent = "No notes selected";
    option.disabled = true;
    option.selected = true;
    select.appendChild(option);
    select.disabled = true;
    return;
  }
  select.disabled = activeMode !== "test" || !soundsReady;
  var placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a note";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);
  AUDIO_CLIPS.slice().sort().forEach(function (note) {
    var option = document.createElement("option");
    option.value = note;
    option.textContent = formatLabel(note);
    select.appendChild(option);
  });
}

function playRandomNote() {
  var answerDisplay = document.getElementById("answer-display");
  answerDisplay.textContent = "";

  if (activeMode !== "test") {
    answerDisplay.textContent = "Switch to test mode to run the guessing exercise.";
    return;
  }
  if (!soundsReady) {
    updateSoundStatus("Loading sounds, please wait...");
    return;
  }
  if (isPlaying) {
    answerDisplay.textContent = "Wait for the current note sequence to finish.";
    return;
  }
  if (!AUDIO_CLIPS.length) {
    answerDisplay.textContent = "Select at least one note to play.";
    return;
  }

  var answer = AUDIO_CLIPS[Math.floor(Math.random() * AUDIO_CLIPS.length)];
  document.getElementById("note-answer").value = answer;
  lastAnswer = answer;
  answerChecked = false;
  enableCheckButton();
  refreshPlayAgainButtonState();
  playSequence(answer);
}

function enableCheckButton() {
  var btn = document.getElementById("check-answer");
  if (btn) btn.disabled = false;
}

function checkAnswer() {
  var answerDisplay = document.getElementById("answer-display");
  var guessSelect = document.getElementById("guess-select");
  var guessValue = guessSelect ? guessSelect.value : "";

  if (activeMode === "intervals") {
    if (!lastIntervalAnswer) {
      answerDisplay.textContent = "Play an interval first.";
      return;
    }
    if (!guessValue) {
      answerDisplay.textContent = "Select an interval first.";
      return;
    }
    var correct = guessValue === lastIntervalAnswer.name;
    var rootLabel = formatLabel(lastIntervalNotes[0]);
    var targetLabel = formatLabel(lastIntervalNotes[1]);
    answerDisplay.textContent = "Answer: " + lastIntervalAnswer.name +
      " (" + rootLabel + " → " + targetLabel + "). Your guess: " + guessValue + "." +
      (correct ? " ✔" : " ✘");

    if (!answerChecked) {
      recordAnswer("intervals", lastIntervalAnswer.name, guessValue, correct);
      answerChecked = true;
      document.getElementById("check-answer").disabled = true;
      renderStats();
    }
    return;
  }

  var answer = document.getElementById("note-answer").value;
  if (!answer) {
    answerDisplay.textContent = "Play a note first.";
    return;
  }
  if (!guessValue) {
    answerDisplay.textContent = "Select a note first.";
    return;
  }
  var correct = guessValue === answer;
  answerDisplay.textContent = "Answer: " + formatLabel(answer) +
    ". Your guess: " + formatLabel(guessValue) + "." +
    (correct ? " ✔" : " ✘");

  if (!answerChecked) {
    recordAnswer("test", formatLabel(answer), formatLabel(guessValue), correct);
    answerChecked = true;
    document.getElementById("check-answer").disabled = true;
    renderStats();
  }
}

function renderStats() {
  var container = document.getElementById("stats-container");
  if (!container) return;

  if (activeMode === "play") {
    container.innerHTML = "";
    return;
  }

  var stats = getStats(activeMode);
  var pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  var modeLabel = activeMode === "intervals" ? "Interval" : "Note";

  var html = '<div class="stats-container">';
  html += '<h4>' + modeLabel + ' Stats</h4>';
  html += '<div class="stats-bar">';
  html += '<span>Correct: ' + stats.correct + '/' + stats.total + ' (' + pct + '%)</span>';
  html += '<span>Streak: ' + stats.streak + '</span>';
  html += '</div>';

  if (stats.history.length > 0) {
    html += '<div class="stats-history">';
    html += '<h5>Recent History</h5>';
    html += '<ul class="history-list">';
    stats.history.forEach(function (entry) {
      var icon = entry.correct ? "✔" : "✘";
      var cls = entry.correct ? "correct" : "wrong";
      html += '<li class="history-item">';
      html += '<span class="history-result ' + cls + '">' + icon + ' ' + entry.answer + ' → ' + entry.guess + '</span>';
      html += '<span class="history-time">' + formatTimeAgo(entry.time) + '</span>';
      html += '</li>';
    });
    html += '</ul>';
    html += '</div>';
  }

  html += '<button class="stats-reset" onclick="handleResetStats()">Reset ' + modeLabel + ' Stats</button>';
  html += '</div>';

  container.innerHTML = html;
}

function handleResetStats() {
  resetStats(activeMode);
  renderStats();
}

loadAllNotes();
