var ALL_AUDIO_CLIPS = [
  "a3", "a4", "a5", "a-3", "a-4", "a-5",
  "b3", "b4", "b5",
  "c3", "c4", "c5", "c6", "c-3", "c-4", "c-5",
  "d3", "d4", "d5", "d-3", "d-4", "d-5",
  "e3", "e4", "e5",
  "f3", "f4", "f5", "f-3", "f-4", "f-5",
  "g3", "g4", "g5", "g-3", "g-4", "g-5"
];

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var buffers = {};
var soundsReady = false;
var loadingPromise = null;

function updateSoundStatus(message, isError) {
  var status = document.getElementById("sound-status");
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? "#c00" : "#2769d5";
}

async function decodeAudioData(arrayBuffer) {
  try {
    return await audioCtx.decodeAudioData(arrayBuffer);
  } catch (error) {
    return await new Promise(function (resolve, reject) {
      audioCtx.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
    });
  }
}

async function loadNote(note) {
  var response = await fetch("./mp3_notes/" + note + ".mp3");
  if (!response.ok) throw new Error("Failed to fetch " + note);
  var arrayBuffer = await response.arrayBuffer();
  buffers[note] = await decodeAudioData(arrayBuffer);
}

function playBuffer(note) {
  if (!soundsReady) return;
  var buffer = buffers[note];
  if (!buffer) {
    console.warn("Missing buffer for", note);
    return;
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  var source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
  return source;
}

async function loadAllNotes() {
  updateSoundStatus("Loading sounds...");
  loadingPromise = Promise.all(ALL_AUDIO_CLIPS.map(loadNote))
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
