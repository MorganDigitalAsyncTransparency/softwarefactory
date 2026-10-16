import { block, group, slab } from './shapes.js';
import { person } from './figures.js';
import { between } from './flow.js';
import { CRANE, HALL, LANES, OUTPUT, PAIR } from './layout.js';

const BAY = 8;
const BAYS = (HALL.right - HALL.left) / BAY;
const WINDOW = [4.6, 6.6];
const DOOR_HALF = 2.4;
const ROOF = 6;
const LIFT_SECONDS = 10;

// How many bays of the back wall stand when `built` of the hall is built.
export function standingBays(built) {
  return Math.floor(built * BAYS);
}

// The parts of the hall that are finished: they change only when another bay stands.
export function hall(standing) {
  return group([
    slab([HALL.left, HALL.back], [HALL.right, HALL.front], [-0.1, 0], 'floor'),
    ...floorLines(),
    ...Array.from({ length: standing }, (_, index) => bay(index)),
    ...sideWall(HALL.left, [[HALL.back, HALL.front]]),
    ...sideWall(HALL.right, [[HALL.back, OUTPUT.z - DOOR_HALF]]),
    ...hatches(),
    ...roof(standing),
  ]);
}

// The work in progress on the hall: the next bay rising behind scaffolding, and the
// crane lifting a panel to it.
export function site(built, time) {
  const standing = standingBays(built);
  const rising = built * BAYS - standing;
  const x1 = HALL.left + standing * BAY;
  return group([
    slab([x1, HALL.back - 0.2], [x1 + BAY, HALL.back + 0.2], [0, Math.max(0.3, rising * HALL.height)], 'wall'),
    scaffold(x1),
    crane(x1 + BAY / 2, time),
  ]);
}

function floorLines() {
  const middles = LANES.slice(1).map((z, index) => (z + LANES[index]) / 2);
  return middles.map((z) => slab([HALL.left + 1, z - 0.06], [HALL.right - 1, z + 0.06], [0, 0.01], 'floorLine'));
}

function bay(index) {
  const [x1, x2] = [HALL.left + index * BAY, HALL.left + (index + 1) * BAY];
  return group([
    slab([x1, HALL.back - 0.2], [x2, HALL.back + 0.2], [0, HALL.height], 'wall'),
    slab([x1 + 0.6, HALL.back + 0.2], [x2 - 0.6, HALL.back + 0.3], WINDOW, 'glass'),
  ]);
}

function scaffold(x1) {
  const poles = [0, 2, 4, 6, 8].flatMap((dx) => [0.8, 2].map((dz) => (
    block([0.08, HALL.height, 0.08], 'scaffold', [x1 + dx, HALL.height / 2, HALL.back + dz])
  )));
  const planks = [3, 6].map((y) => slab([x1, HALL.back + 0.7], [x1 + BAY, HALL.back + 2.1], [y, y + 0.1], 'scaffold'));
  const builders = [[2.5, 3.1, 1], [5.6, 6.1, 2]].map(([dx, y, seed]) => (
    group([person('builder', { seed })], { position: [x1 + dx, y, HALL.back + 1.4], turn: Math.PI / 2 })
  ));
  return group([...poles, ...planks, ...builders]);
}

// A tower crane behind the hall, turned toward the bay that is rising, lifting a wall
// panel again and again.
function crane(targetX, time) {
  const [dx, dz] = [targetX - CRANE.x, HALL.back - 1 - CRANE.z];
  const reach = Math.hypot(dx, dz);
  const lift = (time / LIFT_SECONDS) % 1;
  const panelY = between(0.5, HALL.height + 1, Math.min(1, lift / 0.8));
  const rope = block([0.06, CRANE.height - panelY - 1.5, 0.06], 'steel', [reach, (panelY - CRANE.height + 1.5) / 2, 0]);
  const jib = group([
    slab([-7, -0.5], [CRANE.reach, 0.5], [0, 1], 'builder'),
    block([2.5, 1.5, 1.5], 'machine', [-5.5, -0.8, 0]),
    rope,
    lift < 0.8 && block([BAY - 1, 1.8, 0.3], 'wall', [reach, panelY - CRANE.height + 0.5, 0]),
  ], { position: [CRANE.x, CRANE.height, CRANE.z], turn: -Math.atan2(dz, dx) });
  return group([block([1.2, CRANE.height, 1.2], 'builder', [CRANE.x, CRANE.height / 2, CRANE.z]), jib]);
}

function sideWall(x, spans) {
  const inside = x - Math.sign(x) * 0.25;
  return spans.flatMap(([z1, z2]) => [
    slab([x - 0.2, z1], [x + 0.2, z2], [0, HALL.height], 'wall'),
    slab([inside - 0.05, z1 + 1], [inside + 0.05, z2 - 1], WINDOW, 'glass'),
  ]);
}

// Openings low in the left wall where the parts come in, one for each small belt.
function hatches() {
  return LANES.flatMap((z) => [z - PAIR, z + PAIR]).map((z) => (
    slab([HALL.left + 0.2, z - 0.6], [HALL.left + 0.3, z + 0.6], [0.6, 1.6], 'hatch')
  ));
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
