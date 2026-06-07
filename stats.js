var STATS_KEY = "ear-training-stats";

function defaultModeStats() {
  return { correct: 0, total: 0, streak: 0, history: [] };
}

function loadStats() {
  try {
    var raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { note: defaultModeStats(), intervals: defaultModeStats() };
    var parsed = JSON.parse(raw);
    if (!parsed.note) parsed.note = defaultModeStats();
    if (!parsed.intervals) parsed.intervals = defaultModeStats();
    return parsed;
  } catch (e) {
    return { note: defaultModeStats(), intervals: defaultModeStats() };
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn("Failed to save stats", e);
  }
}

function getStats(mode) {
  var key = mode === "test" ? "note" : "intervals";
  var stats = loadStats();
  return stats[key];
}

function recordAnswer(mode, answer, guess, isCorrect) {
  var key = mode === "test" ? "note" : "intervals";
  var stats = loadStats();
  var m = stats[key];

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

  saveStats(stats);
  return m;
}

function resetStats(mode) {
  var key = mode === "test" ? "note" : "intervals";
  var stats = loadStats();
  stats[key] = defaultModeStats();
  saveStats(stats);
}

function formatTimeAgo(isoString) {
  var diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return "just now";
  var mins = Math.floor(diff / 60);
  if (mins < 60) return mins + " min ago";
  var hours = Math.floor(mins / 60);
  if (hours < 24) return hours + " hr ago";
  var days = Math.floor(hours / 24);
  return days + " day" + (days > 1 ? "s" : "") + " ago";
}
