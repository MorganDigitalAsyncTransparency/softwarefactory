import { STEP, STEPS_PER_BAR, chordAt, hitsAt, shipNote } from './harmony.js';
import { createSynth, kick, hat, clap, bass, pluck, pad, thud, riser } from './synth.js';
import { trace } from './trace.js';
import { FINALE } from './story.js';

const LOOKAHEAD = 0.12;
const MAX_WAITING = 6;

const HITS = {
  // The grid passes the bar as a third argument, which kick would read as its level.
  kick: (synth, t) => kick(synth, t),
  clap,
  hat,
  bass: (synth, t, bar) => bass(synth, t, chordAt(bar)[0] - 12),
};

const SOUNDS = { shipped: playShipped, broken: playBroken, stopped: playStopped, tap: playTap };

// The band: a sequencer on a sixteenth-note grid. The drums and the bass join as the
// factory grows, and every change that ships, stops or is dropped in plays on the grid.
export function createBand() {
  const band = { muted: false, synth: null, step: 0, stage: 0, notes: 0, waiting: [], finale: -Infinity };
  return {
    start: () => band.synth || begin(band),
    toggle: () => toggle(band),
    setStage: (stage) => changeStage(band, stage),
    play: (kind) => band.synth && band.waiting.push(kind),
    tick: () => band.synth && schedule(band),
  };
}

function begin(band) {
  const ctx = new AudioContext();
  band.synth = createSynth(ctx);
  band.origin = ctx.currentTime + 0.05;
  silence(band);
}

function toggle(band) {
  band.muted = !band.muted;
  if (band.synth) silence(band);
}

function silence(band) {
  if (band.muted) band.synth.ctx.suspend();
  else band.synth.ctx.resume();
}

function changeStage(band, stage) {
  if (stage === FINALE && band.stage !== stage) band.finale = Math.floor(band.step / STEPS_PER_BAR) + 1;
  band.stage = stage;
}

function schedule(band) {
  const now = band.synth.ctx.currentTime;
  band.step = Math.max(band.step, Math.ceil((now - band.origin) / STEP));
  band.waiting.splice(0, band.waiting.length - MAX_WAITING);
  while (band.origin + band.step * STEP < now + LOOKAHEAD) {
    playStep(band, band.step, band.origin + band.step * STEP);
    band.step += 1;
  }
}

function playStep(band, step, t) {
  const bar = Math.floor(step / STEPS_PER_BAR);
  const downbeat = step % STEPS_PER_BAR === 0;
  if (downbeat) pad(band.synth, t, chordAt(bar), STEP * STEPS_PER_BAR);
  if (downbeat && bar === band.finale) riser(band.synth, t, STEP * STEPS_PER_BAR * 2);
  if (downbeat && bar === band.finale + 2) playFinale(band, t, bar);
  for (const name of hitsAt(band.stage, step)) HITS[name](band.synth, t, bar);
  const kind = band.waiting.shift();
  if (kind) SOUNDS[kind](band, t, bar);
}

function playFinale(band, t, bar) {
  trace('playFinale');
  kick(band.synth, t, 1.6);
  for (const midi of chordAt(bar)) pluck(band.synth, t, midi + 24, 0.25);
}

function playShipped(band, t, bar) {
  trace('playShipped');
  pluck(band.synth, t, shipNote(bar, band.notes++));
}

function playBroken(band, t, bar) {
  trace('playBroken');
  pluck(band.synth, t, shipNote(bar, band.notes++) + 1, 0.25);
}

function playStopped(band, t) {
  trace('playStopped');
  thud(band.synth, t);
}

function playTap(band, t, bar) {
  trace('playTap');
  pluck(band.synth, t, shipNote(bar, band.notes++) + 12, 0.35);
}
