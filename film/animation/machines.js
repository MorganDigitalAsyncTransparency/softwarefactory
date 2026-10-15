import { block, cylinder, group, slab, sphere } from './shapes.js';
import { robot } from './figures.js';
import { light } from './materials.js';
import { ASSEMBLY, BELT, DOCK, HALL, LANES, OUTPUT } from './layout.js';

const LEG_EVERY = 2.5;

export function belt(start, end, z, width = BELT.width) {
  const legs = [];
  for (let x = start + 0.4; x < end; x += LEG_EVERY) legs.push(...[-1, 1].map((side) => leg(x, z + side * (width / 2 - 0.1))));
  return group([
    slab([start, z - width / 2 - 0.08], [end, z + width / 2 + 0.08], [0.72, 0.94], 'beltFrame'),
    slab([start, z - width / 2], [end, z + width / 2], [0.94, BELT.height], 'belt'),
    ...legs,
  ]);
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
    slab([x - 0.7, z + 1.3], [x + 0.7, z + 2.6], [0, 0.5], 'machine'),
  ]);
}

// The automated check at the left: an arch with a scanning head and a light, watched by
// an AI agent.
export function scanner(x, z, signal) {
  return group([
    group([robot()], { position: [x - 1, 0, z + 1.5], turn: Math.PI / 2 }),
    ...[-1, 1].map((side) => block([0.3, 2.2, 0.3], 'robot', [x, 1.1, z + side * 1.05])),
    block([0.7, 0.45, 2.4], 'robot', [x, 2.35, z]),
    block([0.4, 0.12, 0.8], 'it', [x, 2.08, z]),
    sphere(0.2, light(signal), [x, 2.8, z]),
  ]);
}

// Where the belts end: one machine joins the parts into the finished product.
export function assembly() {
  const intakes = LANES.map((z) => slab([ASSEMBLY.start - 0.05, z - 0.9], [ASSEMBLY.start, z + 0.9], [0.8, 1.9], 'hatch'));
  return group([
    slab([ASSEMBLY.start, LANES[0] - 2.4], [ASSEMBLY.end, LANES.at(-1) + 2.4], [0, 4], 'machine'),
    slab([ASSEMBLY.start + 0.8, LANES[0] - 1.6], [ASSEMBLY.end - 0.8, LANES.at(-1) + 1.6], [4, 5], 'steel'),
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
