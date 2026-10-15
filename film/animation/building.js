import { block, group, slab } from './shapes.js';
import { person } from './figures.js';
import { HALL, LANES, OUTPUT } from './layout.js';

const BAY = 8;
const BAYS = (HALL.right - HALL.left) / BAY;
const WINDOW = [4.6, 6.6];
const DOOR_HALF = 2.4;
const ROOF = 6;

// The factory hall, open at the front and the front right so the camera can look in. The back wall is still
// being built: bays up to `built` stand, the next rises behind scaffolding.
export function building(built) {
  return group([
    slab([HALL.left, HALL.back], [HALL.right, HALL.front], [-0.1, 0], 'floor'),
    ...floorLines(),
    ...backWall(built * BAYS),
    ...sideWall(HALL.left, [[HALL.back, HALL.front]]),
    ...sideWall(HALL.right, [[HALL.back, OUTPUT.z - DOOR_HALF]]),
    ...hatches(),
    ...roof(Math.floor(built * BAYS)),
  ]);
}

function floorLines() {
  const middles = LANES.slice(1).map((z, index) => (z + LANES[index]) / 2);
  return middles.flatMap((z) => [-1, 1].map((side) => (
    slab([HALL.left + 1, z + side * 0.9 - 0.06], [HALL.right - 1, z + side * 0.9 + 0.06], [0, 0.01], 'floorLine')
  )));
}

function backWall(bays) {
  const standing = Math.floor(bays);
  const rising = bays - standing;
  return [...Array.from({ length: standing }, (_, index) => bay(index)), risingBay(standing, rising), scaffold(standing)];
}

function bay(index) {
  const [x1, x2] = [HALL.left + index * BAY, HALL.left + (index + 1) * BAY];
  return group([
    slab([x1, HALL.back - 0.2], [x2, HALL.back + 0.2], [0, HALL.height], 'wall'),
    slab([x1 + 0.6, HALL.back + 0.2], [x2 - 0.6, HALL.back + 0.3], WINDOW, 'glass'),
  ]);
}

function risingBay(index, rising) {
  const x1 = HALL.left + index * BAY;
  return slab([x1, HALL.back - 0.2], [x1 + BAY, HALL.back + 0.2], [0, Math.max(0.3, rising * HALL.height)], 'wall');
}

function scaffold(index) {
  const x1 = HALL.left + index * BAY;
  const poles = [0, 2, 4, 6, 8].flatMap((dx) => [0.8, 2].map((dz) => (
    block([0.08, HALL.height, 0.08], 'scaffold', [x1 + dx, HALL.height / 2, HALL.back + dz])
  )));
  const planks = [3, 6].map((y) => slab([x1, HALL.back + 0.7], [x1 + BAY, HALL.back + 2.1], [y, y + 0.1], 'scaffold'));
  const builders = [[2.5, 3.1, 1], [5.6, 6.1, 2]].map(([dx, y, seed]) => (
    group([person('builder', { seed })], { position: [x1 + dx, y, HALL.back + 1.4], turn: Math.PI / 2 })
  ));
  return group([...poles, ...planks, ...builders]);
}

function sideWall(x, spans) {
  const inside = x - Math.sign(x) * 0.25;
  return spans.flatMap(([z1, z2]) => [
    slab([x - 0.2, z1], [x + 0.2, z2], [0, HALL.height], 'wall'),
    slab([inside - 0.05, z1 + 1], [inside + 0.05, z2 - 1], WINDOW, 'glass'),
  ]);
}

// Openings low in the left wall where the parts come in.
function hatches() {
  return LANES.map((z) => slab([HALL.left + 0.2, z - 1], [HALL.left + 0.3, z + 1], [0.6, 2], 'hatch'));
}

function skeleton(x) {
  return group([
    block([0.4, HALL.height, 0.4], 'steel', [x, HALL.height / 2, HALL.back + 0.4]),
    block([0.4, HALL.height, 0.4], 'steel', [x, HALL.height / 2, HALL.back + ROOF]),
    slab([x - 0.15, HALL.back], [x + 0.15, HALL.back + ROOF], [HALL.height, HALL.height + 0.4], 'steel'),
  ]);
}

// The roof over the back of the hall: closed over the bays that stand, bare steel beams
// over the rest.
function roof(standing) {
  return Array.from({ length: BAYS }, (_, index) => {
    const [x1, x2] = [HALL.left + index * BAY, HALL.left + (index + 1) * BAY];
    if (index >= standing) return skeleton(x1);
    return group([
      slab([x1, HALL.back], [x2, HALL.back + ROOF], [HALL.height, HALL.height + 0.35], 'wall'),
      slab([x1 + 0.5, HALL.back + 2.5], [x2 - 0.5, HALL.back + 4.5], [HALL.height + 0.35, HALL.height + 0.9], 'glass'),
    ]);
  });
}
