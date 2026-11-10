// Pure: the music's grid and harmony. Every sound lands on a sixteenth note, and every
// shipped change plays a tone of the chord that is sounding, so any rhythm of taps
// becomes music.
export const BPM = 118;
export const STEP = 60 / BPM / 4;
export const STEPS_PER_BAR = 16;

const ROOTS = [50, 46, 53, 48];
const TRIADS = [[0, 3, 7], [0, 4, 7], [0, 4, 7], [0, 4, 7]];

const PATTERNS = {
  kick: [[], [0, 8], [0, 8], [0, 4, 8, 12], [0, 4, 8, 12, 14], []],
  clap: [[], [], [], [4, 12], [4, 12], []],
  hat: [[], [], [2, 6, 10, 14], [2, 6, 10, 14], [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15], []],
  bass: [[], [], [0, 3, 6, 10], [0, 3, 6, 8, 10, 14], [0, 3, 6, 8, 10, 14], []],
};

export function chordAt(bar) {
  const index = bar % ROOTS.length;
  return TRIADS[index].map((interval) => ROOTS[index] + interval);
}

export function shipNote(bar, count) {
  const chord = chordAt(bar);
  const octave = 12 * (1 + Math.floor(count / chord.length) % 2);
  return chord[count % chord.length] + octave;
}

export function hitsAt(stage, step) {
  const inBar = step % STEPS_PER_BAR;
  return Object.keys(PATTERNS).filter((name) => PATTERNS[name][stage].includes(inBar));
}

export function frequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}
