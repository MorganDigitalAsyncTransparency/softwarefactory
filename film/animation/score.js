import { CRANE, PANEL_WARNING_AT } from './layout.js';
import { share } from './timeline.js';
import { notesBetween } from './music.js';
import { cues } from './cues.js';

// The film's sound as a score: what plays at a moment of the clock, as plain numbers for
// sound.js to play. The music follows the film's clock, so it plays the whole time under
// everything else (ADR 0008); the clicks follow the line's clock, so they stop with the
// belts; the hum, the crane, the alarms and the cues follow the film.

// A soft click of the belts, at their own even pace while the music speeds up.
const CLICK_SECONDS = 0.75;
// While the cloud is down the belts are quiet and only the room is heard.
const QUIET = 0.25;
const ALARM_PITCHES = [880, 660];

// How loud each lasting sound is: the hum of the running belts, and the alarm or the
// warning with its pitch.
export function levels(shot, { film }) {
  const { state } = shot;
  const outage = Boolean(state?.outage);
  return {
    hum: state ? share(state.reveal, 0, 1) * (outage ? QUIET : 1) : QUIET,
    alert: alertAt(shot, film),
  };
}

// The short sounds that start between the frame before and this one, each given as its
// shot and clock: notes of the music, whose closing chord lands at `finale` on the
// film's clock, a click at the belts' pace, the thud of the crane setting a panel where
// the factory is seen, and the cues.
export function events(before, now, finale) {
  return [
    ...notesBetween(before.clock.film, now.clock.film, finale).map(({ midi, seconds, level }) => ({ kind: 'note', pitch: frequency(midi), seconds, level })),
    ...ticksBetween(before.clock.line, now.clock.line).map(() => ({ kind: 'click' })),
    ...(now.shot.state && crossed(before.clock.film, now.clock.film) ? [{ kind: 'thud' }] : []),
    ...cues(before, now),
  ];
}

function alertAt({ split, progress, state }, film) {
  if (state?.outage) return { level: 1, pitch: ALARM_PITCHES[Math.floor(film * 2) % 2] };
  const warning = split && progress > PANEL_WARNING_AT && film % 1 < 0.5;
  return { level: warning ? 0.6 : 0, pitch: ALARM_PITCHES[1] / 2 };
}

function ticksBetween(from, to) {
  const ticks = [];
  for (let tick = Math.ceil(from / CLICK_SECONDS); tick * CLICK_SECONDS < to; tick += 1) ticks.push(tick);
  return ticks;
}

function crossed(from, to) {
  const setAt = (time) => Math.floor(time / CRANE.liftSeconds - CRANE.setAt);
  return setAt(to) > setAt(from);
}

function frequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}
