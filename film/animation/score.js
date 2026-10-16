import { CRANE, noise } from './layout.js';
import { share } from './timeline.js';

// The film's sound as a score: what plays at a moment of the clock, as plain numbers for
// sound.js to play. The music and the click of the test stations follow the line's
// clock, so they stop with the belts; the hum, the crane and the alarms follow the film.

// The red lights in the split panels come on at this share of their scene.
export const WARNING_AT = 0.7;
const BEAT = 0.75;
const BEATS_PER_CHORD = 8;
// A calm loop of four chords, as MIDI notes: A minor, F, C and G.
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const ARPEGGIO = [0, 1, 2, 1];
const CLICK_EVERY = 2;
// In the halting scene, this share of the beats is left out.
const SKIPPED = 0.4;
// While the cloud is down the belts are quiet and only the room is heard.
const QUIET = 0.25;
const ALARM_PITCHES = [880, 660];

// How loud each lasting sound is: the hum of the running belts, the chord under the
// music, and the alarm or the warning with its pitch.
export function levels(shot, { film, line }) {
  const { state } = shot;
  const outage = Boolean(state?.outage);
  return {
    hum: state ? share(state.reveal, 0, 1) * (outage ? QUIET : 1) : QUIET,
    pad: outage ? 0 : 1,
    chord: chordAt(line).map(frequency),
    alert: alertAt(shot, film),
  };
}

// The short sounds that start between two moments: notes of the music, the click of a
// test station checking a box, and the thud of the crane setting a panel.
export function events(shot, from, to) {
  const beats = beatsBetween(from.line, to.line).filter((beat) => !(shot.uneven && noise(beat) < SKIPPED));
  return [
    ...beats.map((beat) => ({ kind: 'note', pitch: frequency(noteAt(beat) + 12) })),
    ...beats.filter((beat) => beat % CLICK_EVERY === 1).map(() => ({ kind: 'click' })),
    ...(crossed(from.film, to.film) ? [{ kind: 'thud' }] : []),
  ];
}

function alertAt({ split, progress, state }, film) {
  if (state?.outage) return { level: 1, pitch: ALARM_PITCHES[Math.floor(film * 2) % 2] };
  const warning = split && progress > WARNING_AT && film % 1 < 0.5;
  return { level: warning ? 0.6 : 0, pitch: ALARM_PITCHES[1] / 2 };
}

function beatsBetween(from, to) {
  const beats = [];
  for (let beat = Math.floor(from / BEAT) + 1; beat * BEAT <= to; beat += 1) beats.push(beat);
  return beats;
}

function chordAt(line) {
  return CHORDS[Math.floor(line / BEAT / BEATS_PER_CHORD) % CHORDS.length];
}

function noteAt(beat) {
  return CHORDS[Math.floor(beat / BEATS_PER_CHORD) % CHORDS.length][ARPEGGIO[beat % ARPEGGIO.length]];
}

function crossed(from, to) {
  const setAt = (time) => Math.floor(time / CRANE.liftSeconds - CRANE.setAt);
  return setAt(to) > setAt(from);
}

function frequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}
