import { bareBelt, belt, gate, gatePosts, joiner, lock, tester } from './machines.js';
import { accessAt, cabledStations, deniedCrew } from './access.js';
import { box, developer, facingTurn, person, robot } from './figures.js';
import { group } from './shapes.js';
import { CARRIED, boxesOn, carriedSpan, carrierAt, gapMode, fitting, gateSignal, laneFlows } from './flow.js';
import {
  BELT, BELT_WORKERS, CRAWLING_GATE, CREW_SIDE, GAPS, INTAKE, INTAKE_SPAN, INTAKE_TESTS, LANES, TEST_SPAN, middleOf, smallLanes,
} from './layout.js';
import { gateRisen, middleTests, stationBuilt } from './schedule.js';

const BRIDGED = ['closed', 'gate'];
const GATE_HEIGHT = 2.6;
const BIN_EDGE = 1.05;
const SMALL = { scale: 0.6, spacing: 1.8 };
const INTAKE_STRETCH = { start: INTAKE.start, end: INTAKE.end, uneven: false, missing: 0, gates: [] };
const LOCK_LIGHTS = { granted: 'ok', denied: 'stop', waiting: null };
const CABLED = cabledStations();

// The parts of a lane that only change when the state does: the two small belts and
// their joiner, the belt pieces and the bridged gaps. An unfinished lane's last piece
// grows, so it is drawn with what moves.
export function laneBelts(state, laneIndex) {
  const z = LANES[laneIndex];
  const { A, B } = GAPS[laneIndex];
  const last = laneIndex in state.ends ? [] : [[B.end, BELT.end]];
  const pieces = [[BELT.start, A.start], [A.end, B.start], ...last];
  const bridges = Object.entries(GAPS[laneIndex]).filter(([gap]) => BRIDGED.includes(gapMode(state, gap, laneIndex)));
  return group([
    ...smallLanes(laneIndex).map((small) => belt(INTAKE.start, INTAKE.end, small, INTAKE.width)),
    joiner(laneIndex),
    ...pieces.map(([start, end]) => belt(start, end, z)),
    ...bridges.map(([, span]) => belt(span.start, span.end, z)),
  ]);
}

// Everything on a lane that moves: boxes, carriers, and the lights of test stations and
// gates, which all show red while the cloud is down.
export function laneMotion(state, clock, laneIndex) {
  const time = clock.line;
  const z = LANES[laneIndex];
  const flows = laneFlows(state, time, laneIndex);
  const boxes = flows.flatMap((flow) => flow.boxes);
  const light = (busy) => signal(state, busy);
  return group([
    intake({ state, time, laneIndex }, light),
    ...boxes.map((item) => placedBox(item, z)),
    ...flows.flatMap((flow) => flow.stretch.gates.map((item) => gate(item.x, z, light(gateSignal(flow.boxes, item.x)), fitting(item, time)))),
    ...middleTests(laneIndex).map((x, index) => station({ x, z, span: TEST_SPAN, key: `middle ${laneIndex} ${index}` }, state, light(tested(boxes, x)))),
    ...Object.keys(GAPS[laneIndex]).filter((gap) => gapMode(state, gap, laneIndex) === 'open' && !underWork(state, gap, laneIndex))
      .map((gap) => slowlyLaid(state, gap, laneIndex)),
    ...Object.keys(GAPS[laneIndex]).map((gap) => carrier(state, clock, { gap, laneIndex })),
    laneIndex === CRAWLING_GATE.lane && gateCrawling(z, state),
    laneIndex in state.ends && unfinished(GAPS[laneIndex].B.end, state.ends[laneIndex], { z, outage: state.outage }),
  ]);
}

// The two small belts of a lane, from the office desks into the hall, with their test
// stations before the joiner; an AI agent watches the first.
function intake({ state, time, laneIndex }, light) {
  const z = LANES[laneIndex];
  const boxes = smallLanes(laneIndex).flatMap((small, index) => (
    boxesOn(INTAKE_STRETCH, time, { seed: laneIndex * 100 + index * 50, spacing: SMALL.spacing }).map((item) => ({ ...item, z: small }))
  ));
  return group([
    ...boxes.map(({ x, z: small, look }) => group([box(look, { scale: SMALL.scale })], { position: [x, BELT.height, small] })),
    ...INTAKE_TESTS.map((x, index) => (
      station({ x, z, span: INTAKE_SPAN, key: `intake ${laneIndex} ${index}` }, state, light(tested(boxes, x)))
    )),
    group([robot({ time })], { position: [INTAKE_TESTS[0] - 1, 0, z - 1.6], turn: -Math.PI / 2 }),
  ]);
}

// Every light shows red while the cloud is down.
export function signal({ outage }, busy) {
  return outage ? 'stop' : busy;
}

// A test station, or one still being built: a Software factory developer builds it and
// an IT developer connects its new cable.
export function station({ key, ...place }, state, light) {
  const built = stationBuilt(key, state.buildShare);
  if (built === 0) return null;
  if (built === 1) return finished({ key, ...place }, state, light);
  const side = place.z + place.span / 2 + 0.2;
  const seed = Math.round(Math.abs(place.x));
  return group([
    tester({ ...place, built }),
    // The builder runs only on their own side of the IT developer.
    developer({ x: place.x - 1, z: side, seed }, state.outage, { x: [-Infinity, place.x], z: [side, side] }),
    group([person('it', { seed: seed + 1 })], { position: [place.x + 1, 0, side], turn: Math.PI }),
  ]);
}

// A finished station tests only while it has access.
function finished({ key, ...place }, state, light) {
  const { buildShare } = state;
  const access = accessAt(key, buildShare);
  const side = place.z + place.span / 2 + 0.3;
  return group([
    tester(place, access === 'granted' ? light : null),
    CABLED.has(key) && lock(place, signal(state, LOCK_LIGHTS[access])),
    ...deniedCrew(key, buildShare).map((role, index) => (
      group([person(role, { seed: index + 2 })], { position: [place.x + index * 1.2 - 0.6, 0, side], turn: Math.PI / 2 })
    )),
  ]);
}

function tested(boxes, x) {
  return boxes.some((item) => Math.abs(item.x - x) < 0.4) && 'ok';
}

// A box beside the belt (`side`) was pushed off by a gate; an unsafe one is shown as the
// gate saw it, see-through.
function placedBox({ x, side, look }, z) {
  const height = side > BIN_EDGE ? 0.5 : BELT.height;
  return group([box(look, { seen: look === 'unsafe' && side > 0 })], { position: [x, height, z + side] });
}

// Boxes left on the floor where they wait to be carried.
function pile(x, z) {
  return group([box(), box('dented'), box()].map((part, index) => group([part], {
    position: [x + 0.5 + (index % 2) * 0.7, index === 2 ? 0.6 : 0, z + 1.2], turn: index * 0.4,
  })));
}

// An open gap with boxes piled where it starts. Where a belt is being laid into it, very
// slowly, the belt reaches part of the way and a Software factory developer works at its tip.
function slowlyLaid(state, gap, laneIndex) {
  const z = LANES[laneIndex];
  const whole = GAPS[laneIndex][gap];
  const { start } = carriedSpan(state, gap, laneIndex);
  if (start === whole.start) return pile(start, z);
  return group([belt(whole.start, start, z), pile(start, z), worker({ x: start, z: z - CREW_SIDE, seed: laneIndex }, state.outage)]);
}

// A gate rising very slowly over a running belt, with a Software factory developer at
// it: only its posts stand so far, so the boxes pass between them.
function gateCrawling(z, { buildShare, outage }) {
  const { x } = CRAWLING_GATE;
  return group([...gatePosts(x, z, GATE_HEIGHT * gateRisen(buildShare)), worker({ x: x + 0.6, z: z - CREW_SIDE, seed: 2 }, outage)]);
}

function worker(place, outage) {
  return developer({ ...place, turn: facingTurn(0) }, outage);
}

// A belt that is still being laid: Software factory developers on one side of the bare
// frame, and boxes piling up on the other.
function unfinished(from, end, { z, outage }) {
  return group([
    belt(from, end, z),
    bareBelt(end, BELT.end, z),
    pile(end, z),
    ...BELT_WORKERS.map((dx, seed) => developer({ x: end + dx, z: z - 1.2, turn: -Math.PI / 2, seed }, outage)),
  ]);
}

// A Product developer keeps carrying while the line stands still; a robot stops with it.
function carrier(state, clock, { gap, laneIndex }) {
  const mode = gapMode(state, gap, laneIndex);
  const robotCarrier = mode === 'robot';
  if (!CARRIED.includes(mode) || underWork(state, gap, laneIndex)) return null;
  const { x, carrying, facing } = carrierAt(carriedSpan(state, gap, laneIndex), robotCarrier ? clock.line : clock.people, { seed: laneIndex * 7 + (gap === 'B' ? 3 : 0), robot: robotCarrier });
  const figure = robotCarrier ? robot({ carrying, time: clock.line }) : person('product', { seed: laneIndex, carrying, walked: x });
  return group([figure], { position: [x, 0, LANES[laneIndex]], turn: facingTurn(facing) });
}

// Whether a gap is being bridged or gated right now, so no one carries across it.
function underWork(state, gap, laneIndex) {
  return [state.installing, state.growing].some((work) => work && work.gap === gap && work.lane === laneIndex);
}

// A gate rising and a belt growing across a gap, while Software factory developers work on it.
export function construction({ installing, growing }) {
  return group([installing && gateRising(installing), growing && beltGrowing(growing)]);
}

function gateRising({ gap, lane, share }) {
  const rising = gate(middleOf(GAPS[lane][gap]), LANES[lane], null);
  rising.scale.y = Math.max(0.01, share);
  return group([rising, beltGrowing({ gap, lane, share })]);
}

function beltGrowing({ gap, lane, share }) {
  const { start, end } = GAPS[lane][gap];
  return belt(start, start + (end - start) * Math.max(0.01, share), LANES[lane]);
}
