import { el, group, DIGITAL, PHYSICAL } from './svg.js';
import { person } from './figures.js';
import { gate } from './belts.js';
import { world } from './world.js';
import { mismatchPanels } from './panels.js';
import { BELT_HEIGHT, FRAME, GAPS, LANES } from './layout.js';

const OVERVIEW = [FRAME.x, FRAME.y, FRAME.width, FRAME.height];
const MIDDLE = [560, 300, 640, 360];
const START = { gaps: {}, wallBuilt: 0.55 };
const GATED = { ...START, gaps: { A2: 'gate' } };
const AUTOMATED = { ...START, gaps: { A2: 'gate', B2: 'closed', A3: 'robot' } };
const TODAY = { wallBuilt: 0.8, gaps: { ...AUTOMATED.gaps, B1: 'gate', A4: 'closed' } };

// Each drawing returns the camera (an SVG viewBox) and the picture for one frame.
const DRAWINGS = {
  S02: (frame) => factory(START, frame, [[-560, -315, 2720, 1530], OVERVIEW]),
  S04: (frame) => factory(START, frame, [OVERVIEW, [40, 250, 800, 450]]),
  S06: (frame) => factory(START, frame, [[650, 280, 800, 450], [800, 280, 800, 450]]),
  S09: (frame) => factory(START, frame, [OVERVIEW, [600, 320, 560, 315]]),
  S11: ({ progress }) => ({ camera: OVERVIEW, picture: mismatchPanels(progress, PHYSICAL) }),
  S13: gateInstalled,
  S15: stepsAutomated,
  S17: turnsDigital,
  S19: (frame) => factory(TODAY, frame, [MIDDLE, OVERVIEW]),
};

export function checkDrawings(scenes) {
  scenes
    .filter(({ type }) => type === 'scene')
    .forEach(({ id }) => {
      if (!DRAWINGS[id]) throw new Error(`Scene ${id} has no drawing in film/animation/scenes.js.`);
    });
}

export function draw(frame) {
  return DRAWINGS[frame.scene.id](frame);
}

function factory(state, { time, progress }, [from, to], extras = []) {
  return { camera: between(from, to, progress), picture: group([world(state, time, PHYSICAL), ...extras]) };
}

function between(from, to, progress) {
  const eased = progress * progress * (3 - 2 * progress);
  return from.map((value, index) => value + (to[index] - value) * eased);
}

function gateInstalled(frame) {
  const { progress } = frame;
  const laneY = LANES[1];
  const gateX = (GAPS.A.start + GAPS.A.end) / 2;
  const installed = progress > 0.35;
  const testing = progress > 0.5 && progress < 0.75;
  const state = installed ? { ...GATED, gateLights: { A2: testing ? 'stop' : 'ok' } } : START;
  const extras = [
    person(gateX - 40, laneY - 50, PHYSICAL.builder, { hardHat: true }),
    person(gateX + 40, laneY - 50, PHYSICAL.builder, { hardHat: true }),
    person(gateX + 95, laneY - 70, PHYSICAL.infrastructure),
    el('line', { x1: gateX, y1: 345, x2: gateX, y2: laneY - 50, stroke: PHYSICAL.cable, 'stroke-width': 3, opacity: installed ? 1 : 0 }),
  ];
  if (!installed) extras.push(group([gate('A', { laneIndex: 1, y: laneY, state: START, palette: PHYSICAL })], { opacity: progress / 0.35 }));
  if (testing) extras.push(rejectedBox(GAPS.A.start - 16, laneY));
  return factory(state, frame, [[520, 330, 480, 270], [580, 365, 400, 225]], extras);
}

function rejectedBox(x, y) {
  return el('rect', {
    x: x - 12, y: y - 12, width: 24, height: 24, rx: 3,
    fill: PHYSICAL.dent, stroke: PHYSICAL.stop, 'stroke-width': 3,
  });
}

function stepsAutomated(frame) {
  const { progress } = frame;
  const bridged = progress > 0.4;
  const handedOver = progress > 0.5;
  const gaps = { ...GATED.gaps, ...(bridged && { B2: 'closed' }), ...(handedOver && { A3: 'robot' }) };
  const extras = [];
  if (!bridged) extras.push(growingBelt(GAPS.B, LANES[1], Math.max(0, (progress - 0.1) / 0.3)));
  if (handedOver) extras.push(newBuilder(GAPS.A, LANES[2], (progress - 0.5) / 0.5));
  return factory({ ...START, gaps }, frame, [MIDDLE, MIDDLE], extras);
}

function growingBelt({ start, end }, y, share) {
  return el('rect', {
    x: start, y: y - BELT_HEIGHT / 2, width: (end - start) * share, height: BELT_HEIGHT, fill: PHYSICAL.belt,
  });
}

function newBuilder({ end }, y, share) {
  return person(end + 20 + share * 90, y + 50 - share * 40, PHYSICAL.builder, { hardHat: true });
}

function turnsDigital({ time, progress }) {
  const eased = progress * progress * (3 - 2 * progress);
  return {
    camera: MIDDLE,
    picture: group([
      world(AUTOMATED, time, PHYSICAL),
      group([world(AUTOMATED, time, DIGITAL)], { opacity: eased }),
    ]),
  };
}
