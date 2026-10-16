import { hall, site, standingBays } from './building.js';
import { assembly, output } from './machines.js';
import { agents, alarm, cable, cloud, cloudRacks } from './cloud.js';
import { box, facingTurn, person, robot } from './figures.js';
import { group, slab } from './shapes.js';
import { boxesOn } from './flow.js';
import { share } from './timeline.js';
import { construction, laneBelts, laneMotion, signal, station } from './lanes.js';
import { office } from './office.js';
import { serverRoom } from './server-room.js';
import { people } from './people.js';
import { pull, wiring } from './wiring.js';
import { BELT, GAPS, LANES, OUTPUT, OUTPUT_TESTS, beltsLaid, hallBuilt, middleOf, racksBuilt } from './layout.js';

const RELEASE = { spacing: 7, speed: 1.4 };
const still = { key: null, parts: null };
const fixed = {};

// The whole factory at one moment of the `clock` (see scenes.js, lineTime). What changes
// only with the state is built once and kept. The hall, the cloud, some belts and some
// stations are built as the film runs, and are never finished; the belts and the people
// stop when the cloud fails.
export function world(state, clock) {
  const { filmShare } = clock;
  const factory = { ...state, filmShare, built: hallBuilt(filmShare), ends: beltsLaid(filmShare) };
  const shown = layersShown(factory.reveal);
  const { building, machines, cables } = stillParts(factory);
  fixed.ground ??= ground();
  fixed.office ??= office();
  fixed.serverRoom ??= serverRoom();
  fixed.cloud ??= group([cloud()]);
  const sky = group([agents(clock.film), cloudRacks(racksBuilt(filmShare)), factory.outage && alarm(clock.film)]);
  [fixed.cloud, sky].forEach((part) => { part.position.y = (1 - shown.cloud) * 40; });
  const work = group([site(factory.built, clock.film)]);
  [building, work, fixed.office].forEach((part) => { part.scale.y = Math.max(0.01, shown.hall); });
  machines.scale.y = Math.max(0.01, shown.machines);
  fixed.serverRoom.scale.y = Math.max(0.01, shown.cloud);
  pull(cables, { shown: shown.cables, filmShare, outage: factory.outage });
  return group([
    fixed.ground, fixed.office, building, work, machines, fixed.serverRoom, cables, fixed.cloud, sky,
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
    cables: wiring(state),
  };
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

function releases(state, time) {
  const stretch = { start: OUTPUT.start + 1, end: OUTPUT.end, uneven: false, gates: [] };
  const boxes = boxesOn(stretch, time, RELEASE);
  const place = (x, index) => ({ x, z: OUTPUT.z, span: 3.8, clear: 3.1, key: `output 0 ${index}` });
  return [
    ...boxes.map(({ x }) => group([box('good', { scale: 3 })], { position: [x, BELT.height, OUTPUT.z] })),
    ...OUTPUT_TESTS.map((x, index) => station(place(x, index), state, signal(state, boxes.some((item) => Math.abs(item.x - x) < 1) && 'ok'))),
  ];
}

function crewMember({ role, x, z, facing, walking }, time, index) {
  const figure = role === 'robot' ? robot({ time }) : person(role, { seed: index, walked: walking ? x : 0 });
  return group([figure], { position: [x, 0, z], turn: facingTurn(facing) });
}
