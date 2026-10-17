import { BELT, GAPS, SPEED, gapKey, middleOf, noise } from './layout.js';

// Pure motion: every position is computed from the clock, never stored, so any time can
// be drawn directly (R5).
export const SPACING = 2.4;
export const CARRIED = ['open', 'robot'];
const REJECTED_FOR = 4;
// The share of boxes missing on an even belt in the middle, and of rounds a person
// carries nothing.
const MISSING = 0.08;
const IDLE = 0.2;

export function gapMode(state, gap, laneIndex) {
  return state.gaps[gapKey(gap, laneIndex)] ?? 'open';
}

// The pieces of a lane that boxes ride without help. A lane is cut where a gap is still
// carried, by hand or by a robot, and ends early where its belt is not finished; boxes
// after a hand-carried gap come unevenly.
export function stretches(state, laneIndex) {
  const result = [];
  let current = { start: BELT.start, uneven: false, missing: MISSING, gates: [] };
  Object.entries(GAPS[laneIndex]).forEach(([gap, whole]) => {
    const mode = gapMode(state, gap, laneIndex);
    if (mode === 'gate') current.gates.push(middleOf(whole));
    if (!CARRIED.includes(mode)) return;
    const span = carriedSpan(state, gap, laneIndex);
    result.push({ ...current, end: span.start });
    current = { start: span.end, uneven: mode === 'open', missing: MISSING, gates: [] };
  });
  return [...result, { ...current, end: state.ends[laneIndex] ?? BELT.end }];
}

// The part of a gap that is still carried: a belt is being laid slowly into some gaps
// (`laid`, from gapsLaid in schedule.js).
export function carriedSpan({ laid }, gap, laneIndex) {
  const { start, end } = GAPS[laneIndex][gap];
  return { start: start + (end - start) * (laid[gapKey(gap, laneIndex)] ?? 0), end };
}

// Boxes on a stretch. Each box is counted from where the lane starts (`origin`), so a
// box keeps its place when a gap closes. A stretch may miss a share of its boxes; an
// uneven stretch misses more, and has random timing and quality; a gate pushes every box that is not good off the belt.
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
  return gated({ x, side: 0, look: lookOf(stretch, seed) }, stretch.gates);
}

function lookOf({ uneven }, seed) {
  const chance = noise(seed + 0.25);
  if (!uneven || chance > 0.3) return 'good';
  return chance < 0.18 ? 'dented' : 'wrong';
}

function gated(box, gates) {
  const gate = gates.find((x) => box.look !== 'good' && box.x > x);
  if (gate === undefined) return box;
  if (box.x - gate > REJECTED_FOR) return null;
  return { ...box, x: gate, side: Math.min(box.x - gate, 1.6) };
}

// A gate shows red while a box that is not good is at it.
export function gateStops(boxes, gateX) {
  return boxes.some(({ x, side, look }) => look !== 'good' && Math.abs(x - gateX) < 1.2 && side < 1.6);
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
