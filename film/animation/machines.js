import { block, cylinder, group, slab, sphere } from './shapes.js';
import { light } from './materials.js';
import { ALL_LANES, ASSEMBLY, BELT, DOCK, HALL, JOINER, LANES, OUTPUT, PAIR } from './layout.js';

const LEG_EVERY = 2.5;

export function belt(start, end, z, width = BELT.width) {
  return group([
    ...beltFrame(start, end, z, width),
    slab([start, z - width / 2], [end, z + width / 2], [0.94, BELT.height], 'belt'),
  ]);
}

// A belt that is still being laid: the frame and legs stand, the belt itself is missing.
export function bareBelt(start, end, z) {
  return group(beltFrame(start, end, z, BELT.width));
}

function beltFrame(start, end, z, width) {
  const legs = [];
  for (let x = start + 0.4; x < end; x += LEG_EVERY) legs.push(...[-1, 1].map((side) => leg(x, z + side * (width / 2 - 0.1))));
  return [slab([start, z - width / 2 - 0.08], [end, z + width / 2 + 0.08], [0.72, 0.94], 'beltFrame'), ...legs];
}

function leg(x, z) {
  return cylinder([0.06, 0.72], 'steel', [x, 0.36, z]);
}

// A quality gate: a frame over the belt with a light, and a bin beside it for the boxes
// it stops.
export function gate(x, z, signal) {
  return group([
    ...[-1, 1].map((side) => block([0.22, 2.6, 0.22], 'machine', [x, 1.3, z + side * 1.05])),
    block([0.5, 0.4, 2.4], 'machine', [x, 2.7, z]),
    sphere(0.22, light(signal), [x, 3.1, z]),
    slab([x - 0.6, z + 1.05], [x + 0.6, z + 2.05], [0, 0.5], 'machine'),
  ]);
}

// A test station: a tunnel over the belt with a screen and a light that turns green as
// each box is tested. `span` is how wide a stretch of belts it covers, `clear` how high.
// A station that is still being built has only its side walls, rising.
export function tester({ x, z, span, clear = 1.55, built = 1 }, signal) {
  const sides = [-1, 1].map((side) => block([1.2, clear * built, 0.18], 'machine', [x, (clear * built) / 2, z + side * (span / 2 - 0.09)]));
  if (built < 1) return group(sides);
  return group([
    slab([x - 0.6, z - span / 2], [x + 0.6, z + span / 2], [clear, clear + 0.65], 'machine'),
    ...sides,
    block([0.7, 0.45, 0.06], 'it', [x, clear + 0.3, z + span / 2 + 0.04]),
    sphere(0.16, light(signal), [x, clear + 0.85, z]),
  ]);
}

// Where each pair of small belts is joined into one belt with larger boxes.
export function joiner(laneIndex) {
  const z = ALL_LANES[laneIndex];
  return group([
    slab([JOINER.start, z - PAIR - 0.8], [JOINER.end, z + PAIR + 0.8], [0, 1.9], 'machine'),
    slab([JOINER.start + 0.3, z - 0.6], [JOINER.end - 0.3, z + 0.6], [1.9, 2.3], 'steel'),
  ]);
}

// Where the five belts end: one machine joins them into the finished product.
export function assembly() {
  const intakes = LANES.map((z) => slab([ASSEMBLY.start - 0.05, z - 0.9], [ASSEMBLY.start, z + 0.9], [0.8, 1.9], 'hatch'));
  return group([
    slab([ASSEMBLY.start, LANES[0] - 1.6], [ASSEMBLY.end, LANES.at(-1) + 1.6], [0, 4], 'machine'),
    slab([ASSEMBLY.start + 0.8, LANES[0] - 0.8], [ASSEMBLY.end - 0.8, LANES.at(-1) + 0.8], [4, 5], 'steel'),
    ...intakes,
  ]);
}

// The output belt carries the finished product out through the door to the loading dock.
export function output() {
  return group([
    belt(OUTPUT.start, OUTPUT.end, OUTPUT.z, 3),
    slab([DOCK.start, OUTPUT.z - 4], [DOCK.end, OUTPUT.z + 4], [0, 0.7], 'floor'),
    slab([HALL.right - 0.3, OUTPUT.z - 2.6], [HALL.right + 0.3, OUTPUT.z - 2.2], [0, 4.6], 'steel'),
  ]);
}
