import { el, group } from './svg.js';
import { box, person, rack, robot } from './figures.js';
import { lanes } from './belts.js';
import {
  ASSEMBLY, CABLE_ENDS, CLOUD, DOCK, FLOOR, GAPS, LANES, OUTPUT, SCAFFOLD, USERS,
} from './layout.js';

// state: { gaps: { A2: 'gate', ... }, gateLights: { A2: 'stop' }, wallBuilt: 0..1 }
export function world(state, time, palette) {
  return group([
    el('rect', { x: -2000, y: -2000, width: 6000, height: 5000, fill: palette.background }),
    floor(state, time, palette),
    cables(state, palette),
    cloud(time, palette),
    lanes(state, time, palette),
    assembly(time, palette),
    users(time, palette),
    person(1215, 315, palette.infrastructure, { seed: 3 }),
  ]);
}

function floor(state, time, palette) {
  const wallEnd = FLOOR.x + FLOOR.width * state.wallBuilt;
  const right = FLOOR.x + FLOOR.width;
  const bottom = FLOOR.y + FLOOR.height;
  const wall = { stroke: palette.wall, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' };
  return group([
    el('rect', { x: FLOOR.x, y: FLOOR.y, width: FLOOR.width, height: FLOOR.height, fill: palette.floor }),
    el('path', { ...wall, d: `M ${wallEnd} ${FLOOR.y} L ${FLOOR.x} ${FLOOR.y} L ${FLOOR.x} ${bottom} L ${right} ${bottom} L ${right} ${DOCK.y + DOCK.height}` }),
    el('line', { ...wall, x1: right, y1: FLOOR.y + 40, x2: right, y2: DOCK.y, 'stroke-dasharray': '4 14' }),
    el('line', { ...wall, x1: wallEnd, y1: FLOOR.y, x2: right, y2: FLOOR.y, 'stroke-dasharray': '4 14' }),
    scaffold(wallEnd, time, palette),
  ]);
}

function scaffold(wallEnd, time, palette) {
  const start = Math.max(wallEnd, SCAFFOLD.start);
  const poles = [];
  for (let x = start + 20; x < SCAFFOLD.end - 20; x += 70) {
    poles.push(el('line', { x1: x, y1: SCAFFOLD.y - 46, x2: x, y2: SCAFFOLD.y + 6, stroke: palette.roller, 'stroke-width': 3 }));
  }
  const bob = Math.sin(time * 3) * 2;
  return group([
    ...poles,
    el('line', { x1: start, y1: SCAFFOLD.y - 20, x2: SCAFFOLD.end - 20, y2: SCAFFOLD.y - 20, stroke: palette.roller, 'stroke-width': 3 }),
    person(start + 60, SCAFFOLD.y - 34 + bob, palette.builder, { seed: 1, hardHat: true }),
    person(start + 200, SCAFFOLD.y - 34 - bob, palette.builder, { seed: 2, hardHat: true }),
  ]);
}

function cloud(time, palette) {
  const shape = [[-120, 20, 110, 45], [120, 20, 110, 45], [0, -5, 150, 65], [0, 30, 190, 35]];
  // Drawn twice so the outline goes round the whole cloud, not round every puff.
  const puffs = (outline) => shape.map(([dx, dy, rx, ry]) => el('ellipse', {
    cx: CLOUD.x + dx, cy: CLOUD.y + dy, rx, ry, fill: palette.cloud, stroke: palette.cloudEdge, 'stroke-width': outline ? 6 : 0,
  }));
  const hover = Math.sin(time * 1.5) * 3;
  return group([
    ...puffs(true), ...puffs(false),
    rack(CLOUD.x - 60, CLOUD.y + 5, palette), rack(CLOUD.x - 30, CLOUD.y + 5, palette), rack(CLOUD.x, CLOUD.y + 5, palette),
    robot(CLOUD.x + 60, CLOUD.y + 12 + hover, palette),
    robot(CLOUD.x + 110, CLOUD.y + 22 - hover, palette),
    robot(CLOUD.x - 130, CLOUD.y + 25 + hover, palette),
  ]);
}

function cables(state, palette) {
  const ends = [...CABLE_ENDS, ...gateTops(state)];
  return group(ends.map((end, index) => {
    const startX = CLOUD.x - 160 + (index % CABLE_ENDS.length) * 80;
    const startY = CLOUD.y + 50;
    return el('path', {
      d: `M ${startX} ${startY} C ${startX} ${startY + 120}, ${end.x} ${end.y - 140}, ${end.x} ${end.y}`,
      fill: 'none', stroke: palette.cable, 'stroke-width': 3,
    });
  }));
}

// Every gate is wired to the cloud, so it keeps its cable in every later scene.
function gateTops(state) {
  return Object.entries(state.gaps)
    .filter(([, kind]) => kind === 'gate')
    .map(([key]) => {
      const { start, end } = GAPS[key[0]];
      return { x: (start + end) / 2, y: LANES[Number(key[1]) - 1] - 50 };
    });
}

function assembly(time, palette) {
  const travel = DOCK.x + DOCK.width / 2 - OUTPUT.start;
  const position = (time * 45) % travel;
  return group([
    el('rect', { x: ASSEMBLY.x, y: ASSEMBLY.y, width: ASSEMBLY.width, height: ASSEMBLY.height, rx: 8, fill: palette.wall }),
    el('rect', { x: OUTPUT.start, y: OUTPUT.y - 20, width: OUTPUT.end - OUTPUT.start, height: 40, fill: palette.belt }),
    box(OUTPUT.start + position, OUTPUT.y, palette, { scale: 1.9 }),
    el('rect', { x: DOCK.x, y: DOCK.y, width: DOCK.width, height: DOCK.height, rx: 6, fill: palette.roller }),
  ]);
}

function users(time, palette) {
  const reach = Math.sin(time * 2) * 3;
  return group([
    ...USERS.map(({ x, y }, index) => person(x, y, palette.user, { seed: index })),
    box(USERS[0].x - 22, USERS[0].y + 6 + reach, palette, { scale: 1.6 }),
  ]);
}
