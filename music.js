var CHROMATIC_ORDER = ['c', 'c-', 'd', 'd-', 'e', 'f', 'f-', 'g', 'g-', 'a', 'a-', 'b'];

var INTERVALS = [
  { name: "Minor 2nd", semitones: 1 },
  { name: "Major 2nd", semitones: 2 },
  { name: "Minor 3rd", semitones: 3 },
  { name: "Major 3rd", semitones: 4 },
  { name: "Perfect 4th", semitones: 5 },
  { name: "Tritone", semitones: 6 },
  { name: "Perfect 5th", semitones: 7 },
  { name: "Minor 6th", semitones: 8 },
  { name: "Major 6th", semitones: 9 },
  { name: "Minor 7th", semitones: 10 },
  { name: "Major 7th", semitones: 11 },
  { name: "Octave", semitones: 12 },
];

function noteToSemitone(noteId) {
  var match = noteId.match(/^([a-g]-?)(\d+)$/i);
  if (!match) return null;
  var base = match[1].toLowerCase();
  var octave = parseInt(match[2], 10);
  var index = CHROMATIC_ORDER.indexOf(base);
  if (index === -1) return null;
  return octave * 12 + index;
}

function semitoneToNote(semitone) {
  if (semitone < 0) return null;
  var octave = Math.floor(semitone / 12);
  var index = semitone % 12;
  return CHROMATIC_ORDER[index] + octave;
}
