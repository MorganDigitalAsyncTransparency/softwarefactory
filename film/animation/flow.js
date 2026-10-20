import { BELT, GAPS, SPEED, gapKey, middleOf, noise } from './layout.js';
import { share } from './timeline.js';

// Pure motion: every position is computed from the clock, never stored, so any time can
// be drawn directly (R5).
export const SPACING = 2.4;
export const CARRIED = ['open', 'robot'];
const REJECTED_FOR = 4;
// The share of boxes missing on an even belt in the middle, and of rounds a person
// carries nothing.
const MISSING = 0.08;
const IDLE = 0.2;
// The share of boxes that carry something new the product needs, which a gate cannot
// check until IT has fitted it for them.
const NEW = 0.15;
// The share of boxes after a hand-carried gap that look whole but are unsafe inside.
const UNSAFE = 0.12;
// IT lowers the adapter onto a gate over the seconds before the gate is fitted.
export const FITTING_SECONDS = 2;

export function gapMode(state, gap, laneIndex) {
  return state.gaps[gapKey(gap, laneIndex)] ?? 'open';
}

// The pieces of a lane that boxes ride without help. A lane is cut where a gap is still
// carried, by hand or by a robot, and ends early where its belt is not finished; boxes
// after a hand-carried gap come unevenly. Each gate knows from what time on the line's
// clock IT has fitted it for new boxes (`fitted`; never, if it is not listed).
export function stretches(state, laneIndex) {
  const result = [];
  let current = { start: BELT.start, uneven: false, missing: MISSING, gates: [] };
  Object.entries(GAPS[laneIndex]).forEach(([gap, whole]) => {
    const mode = gapMode(state, gap, laneIndex);
    if (mode === 'gate') current.gates.push({ x: middleOf(whole), fittedAt: state.fitted[gapKey(gap, laneIndex)] ?? Infinity });
    if (!CARRIED.includes(mode)) return;
    const span = carriedSpan(state, gap, laneIndex);
    result.push({ ...current, end: span.start });
    current = { start: span.end, uneven: mode === 'open', missing: MISSING, gates: [] };
  });
  return [...result, { ...current, end: state.ends[laneIndex] ?? BELT.end }];
}

// The boxes on each stretch of a middle belt.
export function laneFlows(state, time, laneIndex) {
  return stretches(state, laneIndex).map((stretch) => (
    { stretch, boxes: boxesOn(stretch, time, { seed: laneIndex * 1000, origin: BELT.start }) }
  ));
}

// The part of a gap that is still carried: a belt is being laid slowly into some gaps
// (`laid`, from gapsLaid in schedule.js).
export function carriedSpan({ laid }, gap, laneIndex) {
  const { start, end } = GAPS[laneIndex][gap];
  return { start: start + (end - start) * (laid[gapKey(gap, laneIndex)] ?? 0), end };
}

// Boxes on a stretch. Each box is counted from where the lane starts (`origin`), so a
// box keeps its place when a gap closes. A stretch may miss a share of its boxes; an
// uneven stretch misses more, and has random timing and quality: some boxes are dented,
// the wrong size or unsafe inside though they look whole. Now and then a box is
// new. A gate pushes every box it cannot pass off the belt.
export function boxesOn(stretch, time, { seed = 0, spacing = SPACING, speed = SPEED, origin = stretch.start } = {}) {
  const motion = { stretch, time, speed, origin, period: spacing / speed };
  const first = Math.floor((time - (stretch.end - origin) / speed) / motion.period) - 1;
  const last = Math.floor((time - (stretch.start - origin) / speed) / motion.period);
  const boxes = [];
  for (let index = first; index <= last; index += 1) {
    const box = boxAt(motion, index, seed + index);
    if (box) boxes.push(box);
  }
  return boxes;
}

function boxAt({ stretch, time, speed, origin, period }, index, seed) {
  const late = stretch.uneven ? noise(seed) * period * 0.6 : 0;
  const x = origin + (time - index * period - late) * speed;
  if (x < stretch.start || x > stretch.end) return null;
  if (noise(seed + 0.5) < (stretch.uneven ? 0.25 : stretch.missing)) return null;
  return gated({ x, side: 0, look: lookOf(stretch, seed) }, stretch.gates, { time, speed });
}

function lookOf({ uneven }, seed) {
  const chance = noise(seed + 0.25);
  if (noise(seed + 0.95) < NEW) return 'new';
  if (!uneven) return 'good';
  if (noise(seed + 0.57) < UNSAFE) return 'unsafe';
  if (chance > 0.3) return 'good';
  return chance < 0.18 ? 'dented' : 'wrong';
}

function gated(box, gates, motion) {
  const gate = gates.find((candidate) => box.x > candidate.x && !passes(box, candidate, motion));
  if (gate === undefined) return box;
  if (box.x - gate.x > REJECTED_FOR) return null;
  return { ...box, x: gate.x, side: Math.min(box.x - gate.x, 1.6) };
}

// A good box passes every gate; a new one only a gate that IT had fitted for it by the
// time the box got there.
function passes({ x, look }, { x: gateX, fittedAt }, { time, speed }) {
  return look === 'good' || (look === 'new' && time - (x - gateX) / speed >= fittedAt);
}

// A gate shows red while a damaged or unsafe box it has pushed off lies at it, and amber while a
// new box it cannot check waits there.
export function gateSignal(boxes, gateX) {
  const held = boxes.filter(({ x, side }) => x === gateX && side > 0);
  if (held.some(({ look }) => look !== 'new')) return 'stop';
  return held.length ? 'wait' : 'ok';
}

// How far IT has lowered the adapter onto a gate, from 0 to 1.
export function fitting({ fittedAt }, time) {
  return fittedAt === Infinity ? 0 : share(time, fittedAt - FITTING_SECONDS, fittedAt);
}

// Someone carrying boxes across a gap: a robot keeps a steady beat, a person waits a
// random time for each box and now and then carries nothing for a round.
export function carrierAt({ start, end }, time, { seed = 0, robot = false } = {}) {
  const cycle = robot ? 3 : 5;
  const round = Math.floor(time / cycle + noise(seed));
  const phase = time / cycle + noise(seed) - round;
  const wait = robot ? 0.1 : 0.1 + noise(seed + round) * 0.45;
  const leg = (1 - wait) / 2;
  const [from, to] = [start - 0.4, end + 0.4];
  if (phase < wait || (!robot && noise(seed + round + 0.7) < IDLE)) return { x: from, carrying: false, facing: 1 };
  if (phase < wait + leg) return { x: between(from, to, (phase - wait) / leg), carrying: true, facing: 1 };
  return { x: between(to, from, (phase - wait - leg) / leg), carrying: false, facing: -1 };
}

export function between(from, to, share) {
  const eased = share * share * (3 - 2 * share);
  return from + (to - from) * eased;
}
