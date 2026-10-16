import { bareBelt, belt, gate, joiner, tester } from './machines.js';
import { box, facingTurn, person, robot } from './figures.js';
import { group } from './shapes.js';
import { CARRIED, boxesOn, carrierAt, gapMode, gateStops, stretches } from './flow.js';
import {
  BELT, GAPS, INTAKE, INTAKE_TESTS, LANES, PAIR, TESTS, UNFINISHED_LANE, gapKey, middleOf, smallLanes,
} from './layout.js';

const BRIDGED = ['closed', 'gate'];
const BIN_EDGE = 1.05;
const SMALL = { scale: 0.6, spacing: 1.8 };
const INTAKE_STRETCH = { start: INTAKE.start, end: INTAKE.end, uneven: false, gates: [] };

// The parts of a lane that only change when the state does: the two small belts and
// their joiner, the belt pieces and the bridged gaps. The unfinished lane's last piece
// grows, so it is drawn with what moves.
export function laneBelts(state, laneIndex) {
  const z = LANES[laneIndex];
  const last = laneIndex === UNFINISHED_LANE ? [] : [[GAPS.B.end, BELT.end]];
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
// gates.
export function laneMotion(state, time, laneIndex) {
  const z = LANES[laneIndex];
  const flows = stretches(state, laneIndex).map((stretch) => (
    { stretch, boxes: boxesOn(stretch, time, { seed: laneIndex * 1000, origin: BELT.start }) }
  ));
  const end = flows.at(-1).stretch.end;
  return group([
    intake(time, laneIndex),
    ...flows.flatMap(({ boxes }) => boxes.map((item) => placedBox(item, z))),
    ...flows.flatMap(({ stretch, boxes }) => stretch.gates.map((x) => gate(x, z, gateStops(boxes, x) ? 'stop' : 'ok'))),
    ...TESTS.filter((x) => x < end).map((x) => tester({ x, z, span: 2.2 }, tested(flows.flatMap(({ boxes }) => boxes), x))),
    ...Object.entries(GAPS).filter(([gap]) => gapMode(state, gap, laneIndex) === 'open').map(([, span]) => pile(span.start, z)),
    ...Object.keys(GAPS).map((gap) => carrier(state, time, { gap, laneIndex })),
    laneIndex === UNFINISHED_LANE && unfinished(end, z),
  ]);
}

// The two small belts of a lane, each box checked twice before the joiner, the first
// time watched by an AI agent.
function intake(time, laneIndex) {
  const z = LANES[laneIndex];
  const boxes = smallLanes(laneIndex).flatMap((small, index) => (
    boxesOn(INTAKE_STRETCH, time, { seed: laneIndex * 100 + index * 50, spacing: SMALL.spacing }).map((item) => ({ ...item, z: small }))
  ));
  return group([
    ...boxes.map(({ x, z: small }) => group([box('good', { scale: SMALL.scale })], { position: [x, BELT.height, small] })),
    ...INTAKE_TESTS.map((x) => tester({ x, z, span: 2 * PAIR + INTAKE.width + 0.4 }, tested(boxes, x))),
    group([robot({ time })], { position: [INTAKE_TESTS[0] - 1, 0, z + 1.6], turn: Math.PI / 2 }),
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

// The belt that is still being laid: Builders at its end, and boxes piling up there.
function unfinished(end, z) {
  return group([
    belt(GAPS.B.end, end, z),
    bareBelt(end, BELT.end, z),
    pile(end, z),
    group([person('builder', { seed: 3 })], { position: [end + 0.6, 0, z + 1.2], turn: Math.PI }),
    group([person('builder', { seed: 1 })], { position: [end + 1.8, 0, z - 1.2], turn: Math.PI }),
  ]);
}

function carrier(state, time, { gap, laneIndex }) {
  const mode = gapMode(state, gap, laneIndex);
  const key = gapKey(gap, laneIndex);
  const building = [state.installing, state.growing].some((work) => work && gapKey(work.gap, work.lane) === key);
  if (!CARRIED.includes(mode) || building) return null;
  const { x, carrying, facing } = carrierAt(GAPS[gap], time, { seed: laneIndex * 7 + (gap === 'B' ? 3 : 0), robot: mode === 'robot' });
  const figure = mode === 'robot' ? robot({ carrying, time }) : person('carrier', { seed: laneIndex, carrying, walked: x });
  return group([figure], { position: [x, 0, LANES[laneIndex]], turn: facingTurn(facing) });
}

// A gate rising and a belt growing across a gap, while Builders work on it.
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
