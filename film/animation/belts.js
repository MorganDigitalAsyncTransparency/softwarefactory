import { el, group } from './svg.js';
import { box, person, robot } from './figures.js';
import {
  BELT_END, BELT_HEIGHT, BELT_SPEED, BELT_START, GAPS, LANES, SCANNER_X, gapKey, noise, pingPong,
} from './layout.js';

const SPACING = 60;
const IRREGULAR_SPACING = 95;
const CONNECTED = ['closed', 'gate'];

export function lanes(state, time, palette) {
  return group(LANES.map((y, laneIndex) => lane({ laneIndex, y, state, time, palette })));
}

function lane(context) {
  const flows = stretches(context).map((stretch) => boxPositions(stretch, context));
  return group([
    ...beltPieces(context).map(([start, end]) => belt(start, end, context)),
    ...flows.flat().map(({ x, look }) => box(x, context.y, context.palette, look)),
    ...Object.keys(GAPS).map((gap) => gapActor(gap, context)),
    scanner(flows[0], context),
  ]);
}

function kindOf(gap, { laneIndex, state }) {
  return state.gaps[gapKey(gap, laneIndex)] ?? 'open';
}

function beltPieces(context) {
  const pieces = [[BELT_START, GAPS.A.start], [GAPS.A.end, GAPS.B.start], [GAPS.B.end, BELT_END]];
  const bridges = Object.entries(GAPS)
    .filter(([gap]) => CONNECTED.includes(kindOf(gap, context)))
    .map(([, { start, end }]) => [start, end]);
  return [...pieces, ...bridges];
}

function belt(start, end, { y, time, palette }) {
  const top = y - BELT_HEIGHT / 2;
  const offset = (time * BELT_SPEED) % 20;
  const rollers = [];
  for (let x = start + offset; x < end; x += 20) {
    rollers.push(el('line', { x1: x, y1: top + 4, x2: x, y2: top + BELT_HEIGHT - 4, stroke: palette.roller, 'stroke-width': 2 }));
  }
  return group([el('rect', { x: start, y: top, width: end - start, height: BELT_HEIGHT, fill: palette.belt }), ...rollers]);
}

// A stretch is where boxes flow without a hand-off; an open or robot-carried gap ends it.
function stretches(context) {
  const result = [];
  let start = BELT_START;
  let irregular = false;
  Object.entries(GAPS).forEach(([gap, bounds]) => {
    const kind = kindOf(gap, context);
    if (CONNECTED.includes(kind)) return;
    result.push({ start, end: bounds.start, irregular });
    start = bounds.end;
    irregular = kind === 'open';
  });
  result.push({ start, end: BELT_END, irregular });
  return result;
}

function boxPositions({ start, end, irregular }, { laneIndex, time }) {
  const length = end - start - 14;
  const spacing = irregular ? IRREGULAR_SPACING : SPACING;
  const positions = [];
  for (let index = 0; index < Math.floor(length / spacing); index += 1) {
    const seed = laneIndex * 31 + index;
    const jitter = irregular ? noise(seed) * 50 : 0;
    const x = start + 12 + ((time * BELT_SPEED + index * spacing + laneIndex * 17 + jitter) % length);
    positions.push({ x, look: irregular ? defectOf(seed) : {} });
  }
  return positions;
}

function defectOf(seed) {
  const roll = noise(seed + 0.5);
  if (roll > 0.75) return { dented: true };
  if (roll < 0.2) return { scale: 1.35 };
  return {};
}

function gapActor(gap, context) {
  const kind = kindOf(gap, context);
  if (kind === 'open') return carried(gap, context, carrierFigure);
  if (kind === 'robot') return carried(gap, context, robotFigure);
  if (kind === 'gate') return gate(gap, context);
  return group([]);
}

function carried(gap, { laneIndex, y, time, palette }, figure) {
  const { start, end } = GAPS[gap];
  const seed = laneIndex * 7 + (gap === 'A' ? 0 : 3);
  const period = figure === robotFigure ? 1.6 : 2 + noise(seed) * 1.6;
  const phase = time / period + noise(seed + 1);
  const x = start + (end - start) * pingPong(phase);
  const forward = phase - Math.floor(phase) < 0.5;
  const load = forward ? box(x, y - 4, palette, { scale: 0.8 }) : null;
  return group([pile(start, y, palette), figure(x, y + 6, palette, load)]);
}

function carrierFigure(x, y, palette, load) {
  return person(x, y, palette.carrier, { carrying: load });
}

function robotFigure(x, y, palette, load) {
  return group([robot(x, y, palette), ...(load ? [load] : [])]);
}

function pile(gapStart, y, palette) {
  return group([box(gapStart - 14, y, palette), box(gapStart - 14, y - 22, palette, { scale: 0.9 })]);
}

export function gate(gap, { laneIndex, y, state, palette }) {
  const x = (GAPS[gap].start + GAPS[gap].end) / 2;
  const light = state.gateLights?.[gapKey(gap, laneIndex)] === 'stop' ? palette.stop : palette.ok;
  const post = (postX) => el('rect', { x: postX - 4, y: y - 32, width: 8, height: 52, fill: palette.wall });
  return group([
    post(x - 26), post(x + 26),
    el('rect', { x: x - 30, y: y - 36, width: 60, height: 8, rx: 3, fill: palette.wall }),
    el('circle', { cx: x, cy: y - 44, r: 7, fill: light }),
  ]);
}

function scanner(positions, { y, palette }) {
  const passing = positions.some(({ x }) => Math.abs(x - SCANNER_X) < 14);
  return robot(SCANNER_X, y - 34, palette, passing ? palette.ok : palette.light);
}
