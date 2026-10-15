import { belt, gate, scanner } from './machines.js';
import { box, person, robot } from './figures.js';
import { group } from './shapes.js';
import { boxesOn, carrierAt, gapMode, gateStops, stretches } from './flow.js';
import { BELT, GAPS, LANES, SCANNER_X, gapKey, middleOf } from './layout.js';

const BRIDGED = ['closed', 'gate'];
const BIN_EDGE = 1.3;

// The parts of a lane that only change when the state does: belts and bridged gaps.
export function laneBelts(state, laneIndex) {
  const z = LANES[laneIndex];
  const pieces = [[BELT.start, GAPS.A.start], [GAPS.A.end, GAPS.B.start], [GAPS.B.end, BELT.end]];
  const bridges = Object.entries(GAPS).filter(([gap]) => BRIDGED.includes(gapMode(state, gap, laneIndex)));
  return group([
    ...pieces.map(([start, end]) => belt(start, end, z)),
    ...bridges.map(([, span]) => belt(span.start, span.end, z)),
  ]);
}

// Boxes left on the floor where they wait to be carried.
function pile({ start }, z) {
  return group([box(), box('dented'), box()].map((part, index) => group([part], {
    position: [start + 0.5 + (index % 2) * 0.7, index === 2 ? 0.6 : 0, z + 1.4], turn: index * 0.4,
  })));
}

// Everything on a lane that moves: boxes, carriers, and the lights of scanners and gates.
export function laneMotion(state, time, laneIndex) {
  const z = LANES[laneIndex];
  const flows = stretches(state, laneIndex).map((stretch, index) => (
    { stretch, boxes: boxesOn(stretch, time, { seed: laneIndex * 100 + index * 10 }) }
  ));
  return group([
    ...flows.flatMap(({ boxes }) => boxes.map((item) => placedBox(item, z))),
    ...flows.flatMap(({ stretch, boxes }) => stretch.gates.map((x) => gate(x, z, gateStops(boxes, x) ? 'stop' : 'ok'))),
    scanner(SCANNER_X, z, flows[0].boxes.some(({ x }) => Math.abs(x - SCANNER_X) < 0.5) && 'ok'),
    ...Object.entries(GAPS).filter(([gap]) => gapMode(state, gap, laneIndex) === 'open').map(([, span]) => pile(span, z)),
    ...Object.keys(GAPS).map((gap) => carrier(state, time, { gap, laneIndex })),
  ]);
}

function placedBox({ x, side, look }, z) {
  const height = side > BIN_EDGE ? 0.5 : BELT.height;
  return group([box(look)], { position: [x, height, z + side] });
}

function carrier(state, time, { gap, laneIndex }) {
  const mode = gapMode(state, gap, laneIndex);
  const key = gapKey(gap, laneIndex);
  const building = [state.installing, state.growing].some((work) => work && gapKey(work.gap, work.lane) === key);
  if (!['open', 'robot'].includes(mode) || building) return null;
  const { x, carrying, facing } = carrierAt(GAPS[gap], time, { seed: laneIndex * 7 + (gap === 'B' ? 3 : 0), robot: mode === 'robot' });
  const figure = mode === 'robot'
    ? robot({ carrying, bob: Math.abs(Math.sin(time * 6)) * 0.04 })
    : person('carrier', { seed: laneIndex, carrying, step: x / 1.4 });
  return group([figure], { position: [x, 0, LANES[laneIndex]], turn: facing > 0 ? 0 : Math.PI });
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
