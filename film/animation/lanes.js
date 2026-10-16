import { bareBelt, belt, gate, joiner, tester } from './machines.js';
import { box, facingTurn, person, robot } from './figures.js';
import { group } from './shapes.js';
import { CARRIED, boxesOn, carrierAt, gapMode, gateStops, stretches } from './flow.js';
import {
  BELT, BELT_WORKERS, GAPS, INTAKE, INTAKE_SPAN, INTAKE_TESTS, LANES, TEST_SPAN, middleOf, smallLanes,
} from './layout.js';
import { middleTests, stationBuilt } from './schedule.js';

const BRIDGED = ['closed', 'gate'];
const BIN_EDGE = 1.05;
const SMALL = { scale: 0.6, spacing: 1.8 };
const INTAKE_STRETCH = { start: INTAKE.start, end: INTAKE.end, uneven: false, gates: [] };

// The parts of a lane that only change when the state does: the two small belts and
// their joiner, the belt pieces and the bridged gaps. An unfinished lane's last piece
// grows, so it is drawn with what moves.
export function laneBelts(state, laneIndex) {
  const z = LANES[laneIndex];
  const last = laneIndex in state.ends ? [] : [[GAPS.B.end, BELT.end]];
  const pieces = [[BELT.start, GAPS.A.start], [GAPS.A.end, GAPS.B.start], ...last];
  const bridges = Object.entries(GAPS).filter(([gap]) => BRIDGED.includes(gapMode(state, gap, laneIndex)));
  return group([
    ...smallLanes(laneIndex).map((small) => belt(INTAKE.start, INTAKE.end, small, INTAKE.width)),
    joiner(laneIndex),
    ...pieces.map(([start, end]) => belt(start, end, z)),
    ...bridges.map(([, span]) => belt(span.start, span.end, z)),
  ]);
}

// Everything on a lane that moves: boxes, carriers, and the lights of test stations and
// gates, which all show red while the cloud is down.
export function laneMotion(state, { time, hurried }, laneIndex) {
  const z = LANES[laneIndex];
  const flows = stretches(state, laneIndex).map((stretch) => (
    { stretch, boxes: boxesOn(stretch, time, { seed: laneIndex * 1000, origin: BELT.start }) }
  ));
  const boxes = flows.flatMap((flow) => flow.boxes);
  const light = (busy) => signal(state, busy);
  return group([
    intake({ state, time, laneIndex }, light),
    ...boxes.map((item) => placedBox(item, z)),
    ...flows.flatMap((flow) => flow.stretch.gates.map((x) => gate(x, z, light(gateStops(flow.boxes, x) ? 'stop' : 'ok')))),
    ...middleTests(laneIndex).map((x, index) => station({ x, z, span: TEST_SPAN, key: `middle ${laneIndex} ${index}` }, state, light(tested(boxes, x)))),
    ...Object.entries(GAPS).filter(([gap]) => gapMode(state, gap, laneIndex) === 'open' && !underWork(state, gap, laneIndex))
      .map(([, span]) => pile(span.start, z)),
    ...Object.keys(GAPS).map((gap) => carrier(state, { time, hurried }, { gap, laneIndex })),
    laneIndex in state.ends && unfinished(state.ends[laneIndex], z),
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
    ...boxes.map(({ x, z: small }) => group([box('good', { scale: SMALL.scale })], { position: [x, BELT.height, small] })),
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
export function station({ key, ...place }, { buildShare }, light) {
  const built = stationBuilt(key, buildShare);
  if (built === 0) return null;
  if (built === 1) return tester(place, light);
  const side = place.z + place.span / 2 + 0.2;
  const seed = Math.round(Math.abs(place.x));
  return group([
    tester({ ...place, built }),
    group([person('factory', { seed })], { position: [place.x - 1, 0, side], turn: 0 }),
    group([person('it', { seed: seed + 1 })], { position: [place.x + 1, 0, side], turn: Math.PI }),
  ]);
}

function tested(boxes, x) {
  return boxes.some((item) => Math.abs(item.x - x) < 0.4) && 'ok';
}

function placedBox({ x, side, look }, z) {
  const height = side > BIN_EDGE ? 0.5 : BELT.height;
  return group([box(look)], { position: [x, height, z + side] });
}

// Boxes left on the floor where they wait to be carried.
function pile(x, z) {
  return group([box(), box('dented'), box()].map((part, index) => group([part], {
    position: [x + 0.5 + (index % 2) * 0.7, index === 2 ? 0.6 : 0, z + 1.2], turn: index * 0.4,
  })));
}

// A belt that is still being laid: Software factory developers on one side of the bare
// frame, and boxes piling up on the other.
function unfinished(end, z) {
  return group([
    belt(GAPS.B.end, end, z),
    bareBelt(end, BELT.end, z),
    pile(end, z),
    ...BELT_WORKERS.map((dx, seed) => group([person('factory', { seed })], { position: [end + dx, 0, z - 1.2], turn: -Math.PI / 2 })),
  ]);
}

// A Product developer keeps carrying while the line stands still; a robot stops with it.
function carrier(state, { time, hurried }, { gap, laneIndex }) {
  const mode = gapMode(state, gap, laneIndex);
  if (!CARRIED.includes(mode) || underWork(state, gap, laneIndex)) return null;
  const { x, carrying, facing } = carrierAt(GAPS[gap], mode === 'robot' ? time : hurried, { seed: laneIndex * 7 + (gap === 'B' ? 3 : 0), robot: mode === 'robot' });
  const figure = mode === 'robot' ? robot({ carrying, time }) : person('product', { seed: laneIndex, carrying, walked: x });
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
  const rising = gate(middleOf(GAPS[gap]), LANES[lane], null);
  rising.scale.y = Math.max(0.01, share);
  return group([rising, beltGrowing({ gap, lane, share })]);
}

function beltGrowing({ gap, lane, share }) {
  const { start, end } = GAPS[gap];
  return belt(start, start + (end - start) * Math.max(0.01, share), LANES[lane]);
}
