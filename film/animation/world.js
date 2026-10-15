import { building } from './building.js';
import { assembly, output } from './machines.js';
import { agents, cable, cloud, connect } from './cloud.js';
import { box, facingTurn, person, robot } from './figures.js';
import { group, slab } from './shapes.js';
import { boxesOn } from './flow.js';
import { share } from './timeline.js';
import { construction, laneBelts, laneMotion } from './lanes.js';
import { ASSEMBLY, BELT, GAPS, HALL, LANES, OUTPUT, SCANNER_X, USERS, middleOf } from './layout.js';

const RELEASE = { spacing: 7, speed: 1.4 };
const still = { key: null, parts: null };
const fixed = {};

// The whole factory at one time. What changes only with the state is built once and kept.
export function world(state, time) {
  const shown = layersShown(state.reveal);
  const { hall, machines, cables } = stillParts(state);
  hall.scale.y = Math.max(0.01, shown.hall);
  machines.scale.y = Math.max(0.01, shown.machines);
  cables.children.forEach((wire) => connect(wire, shown.cables));
  fixed.ground ??= ground();
  fixed.cloud ??= group([cloud()]);
  fixed.cloud.position.y = (1 - shown.cloud) * 40;
  return group([
    fixed.ground, hall, machines, cables, fixed.cloud,
    group([agents(time)], { position: fixed.cloud.position.toArray() }),
    shown.product > 0 && moving(state, time),
  ]);
}

function ground() {
  const field = slab([-300, -300], [300, 300], [-0.2, -0.1], 'ground');
  field.receiveShadow = false;
  return field;
}

// The opening scene shows one layer after the other: the building, the machines, the
// product, IT, and last the cables once the cloud is in place, so the viewer learns to
// tell the layers apart.
function layersShown(reveal) {
  const from = (start, length = 0.25) => share(reveal, start, start + length);
  return { hall: from(0), machines: from(0.2), product: from(0.4), cloud: from(0.6), cables: from(0.85, 0.15) };
}

function stillParts(state) {
  const key = JSON.stringify([state.gaps, state.built]);
  if (still.key !== key) Object.assign(still, { key, parts: buildStill(state) });
  return still.parts;
}

function buildStill(state) {
  return {
    hall: building(state.built),
    machines: group([...LANES.map((_, laneIndex) => laneBelts(state, laneIndex)), assembly(), output()]),
    cables: group(stations(state).map((station) => cable(station))),
  };
}

// Where the cables from the cloud end: every scanner and gate, the assembly and the dock.
function stations(state) {
  const gates = Object.entries(state.gaps).filter(([, mode]) => mode === 'gate')
    .map(([key]) => ({ x: middleOf(GAPS[key[0]]), y: 3.3, z: LANES[Number(key[1]) - 1] }));
  return [
    ...LANES.map((z) => ({ x: SCANNER_X, y: 3, z })),
    ...gates,
    { x: middleOf(ASSEMBLY), y: 5, z: OUTPUT.z },
    { x: HALL.right - 0.6, y: 4.6, z: OUTPUT.z - 2.4 },
  ];
}

function moving(state, time) {
  const work = state.installing;
  return group([
    ...LANES.map((_, laneIndex) => laneMotion(state, time, laneIndex)),
    construction(state),
    work && cable({ x: middleOf(GAPS[work.gap]), y: 3.3, z: LANES[work.lane] }, work.share),
    ...releases(time),
    ...USERS.map(([x, z], index) => group([person('user', { seed: index + 1 })], { position: [x, 0, z], turn: Math.PI })),
    group([person('infrastructure', { seed: 2 })], { position: [middleOf(ASSEMBLY) - 4, 0, LANES[0] - 2.6] }),
    ...state.crew.map((member, index) => crewMember(member, time, index)),
  ]);
}

function releases(time) {
  const stretch = { start: OUTPUT.start + 1, end: OUTPUT.end, uneven: false, gates: [] };
  return boxesOn(stretch, time, RELEASE).map(({ x }) => group([box('good', { scale: 3 })], { position: [x, BELT.height, OUTPUT.z] }));
}

function crewMember({ role, x, z, facing, promoted }, time, index) {
  const figure = role === 'robot' ? robot({ time }) : person(role, { seed: index, promoted, walked: role === 'carrier' ? x : 0 });
  return group([figure], { position: [x, 0, z], turn: facingTurn(facing) });
}
