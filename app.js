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
var lastAnswer = "";

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
  var disabled = isPlaying || activeMode !== "test";
  button.disabled = disabled;
  button.classList.toggle("disabled", disabled);
  refreshPlayAgainButtonState();
}

function refreshPlayAgainButtonState() {
  var button = document.getElementById("play-again");
  if (!button) return;
  var disabled = !lastAnswer || isPlaying || activeMode !== "test" || !soundsReady;
  button.disabled = disabled;
  button.classList.toggle("disabled", disabled);
}

function setMode(mode) {
  activeMode = mode;
  document.querySelectorAll(".mode-button").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  var instruction = document.getElementById("mode-instruction");
  if (instruction) {
    instruction.textContent = mode === "play"
      ? "Play mode: Tap any key to hear its sound."
      : "Test mode: play a random note, guess it, and check the answer.";
  }
  refreshPlayButtonState();
  updateGuessOptions();
  var guessSelect = document.getElementById("guess-select");
  if (guessSelect) {
    guessSelect.disabled = mode !== "test" || !AUDIO_CLIPS.length || !soundsReady;
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

function playExistingSequence() {
  var answerDisplay = document.getElementById("answer-display");
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
  if (!lastAnswer) {
    answerDisplay.textContent = "Play a random note first.";
    return;
  }
  playSequence(lastAnswer);
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
  setMode(activeMode);
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
  refreshPlayAgainButtonState();
  playSequence(answer);
}

function checkAnswer() {
  var answer = document.getElementById("note-answer").value;
  if (!answer) {
    document.getElementById("answer-display").textContent = "Play a note first.";
    return;
  }
  var guessSelect = document.getElementById("guess-select");
  var guessValue = guessSelect ? guessSelect.value : "";
  var guessText = guessValue ? " Your guess: " + formatLabel(guessValue) + "." : "";
  document.getElementById("answer-display").textContent = "Answer: " + formatLabel(answer) + "." + guessText;
}

loadAllNotes();
