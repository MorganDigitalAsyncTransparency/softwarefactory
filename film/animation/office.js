import { block, group, slab } from './shapes.js';
import { person } from './figures.js';
import { INTAKE, LANES, OFFICE, smallLanes } from './layout.js';

const DESK = { depth: 1.2, width: 1.2, height: 0.75 };
const ISLANDS = { x: -46, zs: [-9, -4, 1, 6] };

// The open office left of the hall, where Product developers write and test the product.
// Each small belt starts at a desk, so every part the factory takes in comes from here.
export function office() {
  const lineDesks = LANES.flatMap((_, laneIndex) => smallLanes(laneIndex));
  return group([
    slab([OFFICE.start, OFFICE.back], [OFFICE.end, OFFICE.front], [-0.1, 0.02], 'officeFloor'),
    ...lineDesks.map((z, index) => desk(INTAKE.start - DESK.depth / 2, z, { seed: index, facing: 0 })),
    ...ISLANDS.zs.flatMap((z, index) => island(z, index)),
  ]);
}

// Two rows of desks facing each other, a developer at each.
function island(z, index) {
  return [-1, 1].flatMap((side) => [-0.7, 0.7].map((dz, seat) => (
    desk(ISLANDS.x + side * DESK.depth / 2, z + dz, { seed: index * 4 + seat + side, facing: side < 0 ? 0 : Math.PI })
  )));
}

// A desk with a screen, and a developer working at it from the side `facing` turns away from.
function desk(x, z, { seed, facing }) {
  return group([
    slab([-DESK.depth / 2, -DESK.width / 2 + 0.05], [DESK.depth / 2, DESK.width / 2 - 0.05], [0, DESK.height], 'desk'),
    block([0.06, 0.45, 0.7], 'screen', [0.1, DESK.height + 0.25, 0]),
    group([person('product', { seed })], { position: [-DESK.depth / 2 - 0.45, 0, 0] }),
  ], { position: [x, 0, z], turn: facing });
}
