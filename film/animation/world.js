import { hall, site, standingBays } from './building.js';
import { assembly, output, tester } from './machines.js';
import { agents, alarm, cable, cloud, connect } from './cloud.js';
import { box, facingTurn, person, robot } from './figures.js';
import { group, slab } from './shapes.js';
import { material } from './materials.js';
import { boxesOn } from './flow.js';
import { share } from './timeline.js';
import { construction, laneBelts, laneMotion } from './lanes.js';
import { office } from './office.js';
import { people } from './people.js';
import {
  ASSEMBLY, BELT, GAPS, HALL, INTAKE_TESTS, LANES, OUTPUT, OUTPUT_TESTS, TESTS, beltsLaid, hallBuilt, middleOf,
} from './layout.js';

const RELEASE = { spacing: 7, speed: 1.4 };
const still = { key: null, parts: null };
const fixed = {};

// The whole factory at one moment of the `clock` (see scenes.js, lineTime). What changes
// only with the state is built once and kept. The hall and some belts are built as the
// film runs, and are never finished; the belts and the people stop when the cloud fails.
export function world(state, clock) {
  const factory = { ...state, built: hallBuilt(clock.filmShare), ends: beltsLaid(clock.filmShare) };
  const shown = layersShown(factory.reveal);
  const { building, machines, cables } = stillParts(factory);
  fixed.ground ??= ground();
  fixed.office ??= office();
  fixed.cloud ??= group([cloud()]);
  fixed.cloud.position.y = (1 - shown.cloud) * 40;
  const work = group([site(factory.built, clock.film)]);
  [building, work, fixed.office].forEach((part) => { part.scale.y = Math.max(0.01, shown.hall); });
  machines.scale.y = Math.max(0.01, shown.machines);
  cables.children.forEach((wire) => Object.assign(connect(wire, shown.cables), { material: material(factory.outage ? 'stop' : 'it') }));
  return group([
    fixed.ground, fixed.office, building, work, machines, cables, fixed.cloud,
    group([agents(clock.film), factory.outage && alarm(clock.film)], { position: fixed.cloud.position.toArray() }),
    shown.product > 0 && moving(factory, clock.line),
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
  const key = JSON.stringify([state.gaps, standingBays(state.built)]);
  if (still.key !== key) Object.assign(still, { key, parts: buildStill(state) });
  return still.parts;
}

function buildStill(state) {
  return {
    building: hall(standingBays(state.built)),
    machines: group([...LANES.map((_, laneIndex) => laneBelts(state, laneIndex)), assembly(), output()]),
    cables: group(stations(state).map((station) => cable(station))),
  };
}

// Where the cables from the cloud end: the first test station on each pair of small
// belts and on each of the five belts, every gate, the assembly, the first test station
// on the output and the dock.
function stations(state) {
  const gates = Object.entries(state.gaps).filter(([, mode]) => mode === 'gate')
    .map(([key]) => ({ x: middleOf(GAPS[key[0]]), y: 3.3, z: LANES[Number(key[1]) - 1] }));
  const tests = LANES.map((z) => ({ x: TESTS[0], y: 2.6, z }));
  return [
    ...LANES.map((z) => ({ x: INTAKE_TESTS[0], y: 2.6, z })),
    ...tests,
    ...gates,
    { x: middleOf(ASSEMBLY), y: 5, z: OUTPUT.z },
    { x: OUTPUT_TESTS[0], y: 4.2, z: OUTPUT.z },
    { x: HALL.right - 0.6, y: 4.6, z: OUTPUT.z - 2.4 },
  ];
}

function moving(state, time) {
  const work = state.installing;
  return group([
    ...LANES.map((_, laneIndex) => laneMotion(state, time, laneIndex)),
    construction(state),
    work && cable({ x: middleOf(GAPS[work.gap]), y: 3.3, z: LANES[work.lane] }, work.share),
    ...releases(state, time),
    people(time),
    ...state.crew.map((member, index) => crewMember(member, time, index)),
  ]);
}

function releases({ outage }, time) {
  const stretch = { start: OUTPUT.start + 1, end: OUTPUT.end, uneven: false, gates: [] };
  const boxes = boxesOn(stretch, time, RELEASE);
  return [
    ...boxes.map(({ x }) => group([box('good', { scale: 3 })], { position: [x, BELT.height, OUTPUT.z] })),
    ...OUTPUT_TESTS.map((x) => tester({ x, z: OUTPUT.z, span: 3.8, clear: 3.1 }, outage ? 'stop' : boxes.some((item) => Math.abs(item.x - x) < 1) && 'ok')),
  ];
}

function crewMember({ role, x, z, facing, walking }, time, index) {
  const figure = role === 'robot' ? robot({ time }) : person(role, { seed: index, walked: walking ? x : 0 });
  return group([figure], { position: [x, 0, z], turn: facingTurn(facing) });
}
