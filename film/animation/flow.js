import { BELT, GAPS, SPEED, gapKey, middleOf, noise } from './layout.js';

// Pure motion: every position is computed from the clock, never stored, so any time can
// be drawn directly (R5).
export const SPACING = 2.4;
export const CARRIED = ['open', 'robot'];
const REJECTED_FOR = 4;

export function gapMode(state, gap, laneIndex) {
  return state.gaps[gapKey(gap, laneIndex)] ?? 'open';
}

// The pieces of a lane that boxes ride without help. A lane is cut where a gap is still
// carried, by hand or by a robot, and ends early where its belt is not finished; boxes
// after a hand-carried gap come unevenly.
export function stretches(state, laneIndex) {
  const result = [];
  let current = { start: BELT.start, uneven: false, gates: [] };
  Object.entries(GAPS).forEach(([gap, span]) => {
    const mode = gapMode(state, gap, laneIndex);
    if (mode === 'gate') current.gates.push(middleOf(span));
    if (!CARRIED.includes(mode)) return;
    result.push({ ...current, end: span.start });
    current = { start: span.end, uneven: mode === 'open', gates: [] };
  });
  return [...result, { ...current, end: state.ends[laneIndex] ?? BELT.end }];
}

// Boxes on a stretch. Each box is counted from where the lane starts (`origin`), so a
// box keeps its place when a gap closes. An uneven stretch has random gaps, timing and
// quality; a gate pushes every box that is not good off the belt.
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
  if (stretch.uneven && noise(seed + 0.5) < 0.25) return null;
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
// random time for each box.
export function carrierAt({ start, end }, time, { seed = 0, robot = false } = {}) {
  const cycle = robot ? 3 : 5;
  const round = Math.floor(time / cycle + noise(seed));
  const phase = time / cycle + noise(seed) - round;
  const wait = robot ? 0.1 : 0.1 + noise(seed + round) * 0.45;
  const leg = (1 - wait) / 2;
  const [from, to] = [start - 0.4, end + 0.4];
  if (phase < wait) return { x: from, carrying: false, facing: 1 };
  if (phase < wait + leg) return { x: between(from, to, (phase - wait) / leg), carrying: true, facing: 1 };
  return { x: between(to, from, (phase - wait - leg) / leg), carrying: false, facing: -1 };
}

export function between(from, to, share) {
  const eased = share * share * (3 - 2 * share);
  return from + (to - from) * eased;
}
