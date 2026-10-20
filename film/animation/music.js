// The film's music: the theme of In the Hall of the Mountain King, from Peer Gynt,
// written out as MIDI notes so the browser can play it (ADR 0007). The piece is in the
// public domain. As in the original, the theme is played again and again, faster and
// louder each time; it follows the line's clock, so it stops with the belts, and its
// closing chord lands at `finale`, the line's time when the last scene begins.
const FIRST_BEATS = 1.2;
const STATEMENTS = 4;
const STEPS_PER_BEAT = 2;
// Each note as a MIDI pitch and its length in eighths (steps). Two bars that open the
// theme and two that answer them, in B minor; then the same a fifth higher.
const OPENING = [[47, 1], [49, 1], [50, 1], [52, 1], [54, 1], [50, 1], [54, 2], [53, 1], [49, 1], [53, 2], [52, 1], [48, 1], [52, 2]];
const ANSWER = [[47, 1], [49, 1], [50, 1], [52, 1], [54, 1], [50, 1], [54, 1], [59, 1], [57, 1], [54, 1], [50, 1], [54, 1], [57, 4]];
const RAISED = [
  [54, 1], [56, 1], [58, 1], [59, 1], [61, 1], [58, 1], [61, 2], [62, 1], [58, 1], [62, 2], [61, 1], [58, 1], [61, 2],
  [54, 1], [56, 1], [58, 1], [59, 1], [61, 1], [58, 1], [61, 1], [66, 1], [64, 1], [61, 1], [58, 1], [61, 1], [64, 4],
];
const THEME = [...OPENING, ...ANSWER, ...OPENING, ...ANSWER, ...RAISED, ...OPENING, ...ANSWER];
const STARTS = startsOf(THEME);
const STEPS = THEME.reduce((steps, [, length]) => steps + length, 0);
const FINAL_CHORD = [35, 47, 54, 59, 62];
const FINAL_RING_SECONDS = 6;
// Notes are short and detached, as plucked strings, and each of the first plays adds
// the theme an octave higher, up to three octaves at once.
const DETACHED = 0.6;
const OCTAVES = [0, 12, 24];

// The notes that start from `from` up to just before `to` seconds of the line's clock,
// each with its step, how long it rings and how loud it is.
export function notesBetween(from, to, finale) {
  const tempo = tempoFor(finale);
  const notes = [];
  for (let step = Math.ceil(tempo.stepAt(from)); step < tempo.stepAt(to); step += 1) {
    notes.push(...notesAt(step, tempo.beatsAt(step)).map((note) => ({ step, ...note })));
  }
  return notes;
}

function notesAt(step, beatsPerSecond) {
  const [statement, place] = [Math.floor(step / STEPS), step % STEPS];
  if (statement === STATEMENTS && place === 0) return FINAL_CHORD.map((midi) => ({ midi, seconds: FINAL_RING_SECONDS, level: 1 }));
  if (statement >= STATEMENTS || !STARTS.has(place)) return [];
  const [midi, length] = STARTS.get(place);
  const level = 0.4 + (0.6 * step) / (STATEMENTS * STEPS);
  const seconds = (DETACHED * length) / STEPS_PER_BEAT / beatsPerSecond;
  return OCTAVES.slice(0, Math.min(statement + 1, OCTAVES.length)).map((octave) => ({ midi: midi + octave, seconds, level }));
}

// The tempo rises evenly from `FIRST_BEATS` a second. The beats played by a time are
// the area under that line; the average tempo times `finale` must hold every play of
// the theme, which sets how fast it rises.
function tempoFor(finale) {
  const beats = (STATEMENTS * STEPS) / STEPS_PER_BEAT;
  const rising = (2 * (beats / finale - FIRST_BEATS)) / finale;
  const beatsBy = (time) => FIRST_BEATS * time + (rising * time * time) / 2;
  // The time of a beat, solving the area above for time.
  const timeOf = (beat) => (Math.sqrt(FIRST_BEATS ** 2 + 2 * rising * beat) - FIRST_BEATS) / rising;
  return {
    stepAt: (time) => STEPS_PER_BEAT * beatsBy(time),
    beatsAt: (step) => FIRST_BEATS + rising * timeOf(step / STEPS_PER_BEAT),
  };
}

function startsOf(notes) {
  let at = 0;
  return new Map(notes.map((note) => {
    const start = at;
    at += note[1];
    return [start, note];
  }));
}
