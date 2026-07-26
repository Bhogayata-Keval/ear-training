var ALL_AUDIO_CLIPS = [
  "a3", "a4", "a5", "a-3", "a-4", "a-5",
  "b3", "b4", "b5",
  "c3", "c4", "c5", "c6", "c-3", "c-4", "c-5",
  "d3", "d4", "d5", "d-3", "d-4", "d-5",
  "e3", "e4", "e5",
  "f3", "f4", "f5", "f-3", "f-4", "f-5",
  "g3", "g4", "g5", "g-3", "g-4", "g-5"
];

var sampler = null;
var soundsReady = false;
var loadingPromise = null;

function updateSoundStatus(message, isError) {
  var status = document.getElementById("sound-status");
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? "#c00" : "#2769d5";
}

function noteIdToTone(noteId) {
  var match = noteId.match(/^([a-g])(-?)(\d+)$/i);
  if (!match) return noteId;
  var letter = match[1].toUpperCase();
  var sharp = match[2] === "-" ? "#" : "";
  var octave = match[3];
  return letter + sharp + octave;
}

function playBuffer(noteId) {
  if (!soundsReady || !sampler) return;
  if (Tone.context.state !== "running") Tone.context.resume();
  sampler.triggerAttackRelease(noteIdToTone(noteId), 1);
}

async function loadAllNotes() {
  updateSoundStatus("Loading sounds…");

  function resumeAudio() {
    Tone.start();
    document.removeEventListener("click", resumeAudio);
    document.removeEventListener("keydown", resumeAudio);
    document.removeEventListener("touchstart", resumeAudio);
  }
  document.addEventListener("click", resumeAudio);
  document.addEventListener("keydown", resumeAudio);
  document.addEventListener("touchstart", resumeAudio);

  sampler = new Tone.Sampler({
    urls: {
      A2: "A2.mp3",
      C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
      A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
      A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
      A5: "A5.mp3", C6: "C6.mp3",
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
  }).toDestination();

  loadingPromise = Tone.loaded()
    .then(function () {
      soundsReady = true;
      updateSoundStatus("Sounds ready");
      refreshPlayButtonState();
      updateGuessOptions();
    })
    .catch(function (error) {
      console.error(error);
      updateSoundStatus("Failed to load sounds", true);
    });

  return loadingPromise;
}
