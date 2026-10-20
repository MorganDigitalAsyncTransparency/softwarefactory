import { hall, site, standingBays } from './building.js';
import { adapter, assembly, output } from './machines.js';
import { agents, alarm, cable, cloud, cloudRacks, itDevelopers } from './cloud.js';
import { box, bubble, codeSign, facingTurn, person, robot } from './figures.js';
import { group, slab } from './shapes.js';
import { boxesOn } from './flow.js';
import { share } from './timeline.js';
import { construction, laneBelts, laneMotion, signal, station } from './lanes.js';
import { office } from './office.js';
import { cardReader, firewall, roomRacks, serverRoom } from './server-room.js';
import { firewallAt, readerVisit } from './access.js';
import { newLane } from './new-lane.js';
import { people as walkers } from './people.js';
import { pull, wiring } from './wiring.js';
import { BELT, GAPS, LANES, OUTPUT, OUTPUT_TESTS, middleOf } from './layout.js';
import { beltsLaid, gapsLaid, hallBuilt, racksBuilt, racksFitted, roomRacksBuilt } from './schedule.js';

// What a speech bubble shows, by what the crew member talks about.
const SUBJECTS = { new: () => box('new'), adapter, code: codeSign };
const RELEASE = { spacing: 7, speed: 1.4 };
// The release is sealed after its last test station, before it leaves for the dock, where
// an IT security developer watches over the seal.
const SEALED_FROM = OUTPUT_TESTS.at(-1) + 1.5;
const SEALER = [SEALED_FROM, 0, OUTPUT.z + 2.1];
const still = { key: null, parts: null };
const fixed = {};

// The whole factory at one moment of the `clock` (see scenes.js, lineTime and
// peopleTime). What changes only with the state is built once and kept. The hall, the
// cloud, the server room, a sixth lane, some belts and some stations are built as the
// film runs (schedule.js) and are never finished. When the cloud fails the belts and
// robots stop, the people hurry about and the Software factory developers run about to
// find the fault.
export function world(state, clock) {
  const { buildShare } = clock;
  const factory = {
    ...state, buildShare, built: hallBuilt(buildShare), ends: beltsLaid(buildShare), laid: gapsLaid(buildShare), fitted: onLine(state.fitted, clock),
  };
  const shown = layersShown(factory.reveal);
  const { building, machines, cables } = stillParts(factory);
  fixed.ground ??= ground();
  fixed.office ??= office();
  fixed.serverRoom ??= serverRoom();
  fixed.cloud ??= group([cloud()]);
  const sky = group([agents(clock.film), itDevelopers(clock.people), cloudRacks(racksBuilt(buildShare), racksFitted(buildShare)), factory.outage && alarm(clock.film)]);
  [fixed.cloud, sky].forEach((part) => { part.position.y = (1 - shown.cloud) * 40; });
  const work = group([site(factory, clock.film)]);
  [building, work, fixed.office].forEach((part) => risen(part, shown.hall));
  risen(machines, shown.machines);
  risen(fixed.serverRoom, shown.cloud);
  pull(cables, { shown: shown.cables, buildShare, outage: factory.outage });
  return group([
    fixed.ground, fixed.office, building, work, machines, fixed.serverRoom, cables, fixed.cloud, sky,
    risen(roomRacks(roomRacksBuilt(buildShare)), shown.cloud),
    risen(cardReader(readerVisit(buildShare)), shown.cloud),
    risen(firewall(firewallAt(buildShare)), shown.cloud),
    risen(newLane(factory), shown.machines),
    shown.product > 0 && moving(factory, clock),
  ]);
}

// The times when gates were fitted, from the film's clock to the line's. The line's clock
// only falls behind during the outage, before any gate is fitted.
function onLine(fitted, { film, line }) {
  return Object.fromEntries(Object.entries(fitted).map(([key, at]) => [key, at - (film - line)]));
}

// A part of the opening that rises out of the floor as its layer is revealed.
function risen(part, shown) {
  part.scale.y = Math.max(0.01, shown);
  return part;
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

function moving(state, { line: time, people }) {
  const work = state.installing;
  return group([
    ...LANES.map((_, laneIndex) => laneMotion(state, { line: time, people }, laneIndex)),
    construction(state),
    work && cable({ x: middleOf(GAPS[work.lane][work.gap]), y: 3.3, z: LANES[work.lane] }, work.share),
    ...releases(state, time),
    walkers(people, state.outage),
    ...state.crew.map((member, index) => crewMember(member, time, index)),
  ]);
}

function releases(state, time) {
  const stretch = { start: OUTPUT.start + 1, end: OUTPUT.end, uneven: false, missing: 0, gates: [] };
  const boxes = boxesOn(stretch, time, RELEASE);
  const place = (x, index) => ({ x, z: OUTPUT.z, span: 3.8, clear: 3.1, key: `output 0 ${index}` });
  return [
    ...boxes.map(({ x }) => group([box('good', { scale: 3, sealed: x > SEALED_FROM })], { position: [x, BELT.height, OUTPUT.z] })),
    ...OUTPUT_TESTS.map((x, index) => station(place(x, index), state, signal(state, boxes.some((item) => Math.abs(item.x - x) < 1) && 'ok'))),
    group([person('security', { seed: 3 })], { position: SEALER, turn: Math.PI / 2 }),
  ];
}

// A crew member may be talking, with a bubble that shows a new box, an IT adapter or code.
function crewMember({ role, x, z, facing, walking, says }, time, index) {
  const figure = role === 'robot' ? robot({ time }) : person(role, { seed: index, walked: walking ? x : 0 });
  const talk = says && group([bubble(SUBJECTS[says]())], { position: [x, 0, z] });
  return group([group([figure], { position: [x, 0, z], turn: facingTurn(facing) }), talk]);
}
