import { between } from './flow.js';
import { DOCK, GAPS, LANES, OUTPUT, middleOf } from './layout.js';
import { share } from './timeline.js';

// Cameras are [position, target] in metres.
const OVERVIEW = [[4, 47, 62], [3, 8.5, -3]];
const HIGH = [[-34, 80, 118], [3, 12, -3]];
const LEFT = [[-17, 13, 17], [-21, 1, -1.5]];
const MIDDLE = [[1, 12, 17], [1, 1, -1.5]];
const DOOR_VIEW = [[DOCK.start - 10, 12, 21], [DOCK.start - 6, 1.5, OUTPUT.z]];
const DOCK_VIEW = [[DOCK.end - 2, 8, 17], [DOCK.end - 1, 1.5, OUTPUT.z]];
const GATE = { x: middleOf(GAPS.B), z: LANES[1] };
const GATE_TARGET = [GATE.x - 0.5, 1.3, GATE.z];
const START = { gaps: {}, built: 0.55, reveal: 1, digital: 0, crew: [] };
const GATED = { ...START, gaps: { B2: 'gate' } };
const AUTOMATED = { ...START, gaps: { ...GATED.gaps, A2: 'closed', A3: 'robot' } };
const TODAY = {
  ...START,
  built: 0.8,
  gaps: { ...AUTOMATED.gaps, B1: 'gate', A4: 'closed', B4: 'gate' },
  crew: [
    { role: 'builder', x: middleOf(GAPS.B) - 1, z: LANES[2] + 1.4, facing: 1 },
    { role: 'builder', x: middleOf(GAPS.B) + 1, z: LANES[2] + 1.4, facing: -1 },
    { role: 'infrastructure', x: middleOf(GAPS.B), z: LANES[2] - 1.6, facing: 0 },
  ],
};

// Each drawing returns the shot for one frame: a camera move and the world's state.
const DRAWINGS = {
  S02: ({ progress }) => shot([HIGH, OVERVIEW], progress, { ...START, reveal: progress / 0.85 }),
  S04: ({ progress }) => shot([OVERVIEW, LEFT], progress, START),
  S06: ({ progress }) => shot([DOOR_VIEW, DOCK_VIEW], progress, START),
  S09: ({ progress }) => shot([OVERVIEW, MIDDLE], progress, START),
  S11: ({ progress }) => ({ split: true, progress }),
  S13: gateInstalled,
  S15: stepsAutomated,
  S17: ({ progress }) => shot([MIDDLE, [[1, 16, 21], [1, 1, -2]]], progress, {
    ...AUTOMATED, digital: Math.min(1, progress / 0.7),
  }),
  S19: ({ progress }) => shot([MIDDLE, OVERVIEW], progress, TODAY),
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

function shot([from, to], progress, state) {
  const camera = from.map((point, index) => point.map((value, axis) => between(value, to[index][axis], progress)));
  return { camera, state };
}

function gateInstalled({ progress }) {
  const installed = progress > 0.4;
  const crew = [
    { role: 'builder', x: GATE.x - 1.6, z: GATE.z + 1.4, facing: 1 },
    { role: 'builder', x: GATE.x + 1.6, z: GATE.z + 1.4, facing: -1 },
    { role: 'infrastructure', x: GATE.x + 0.4, z: GATE.z - 1.6, facing: 0 },
  ];
  const state = installed ? { ...GATED, crew } : { ...START, crew, installing: { gap: 'B', lane: 1, share: share(progress, 0, 0.4) } };
  return shot([[[GATE.x + 7, 7, GATE.z + 13], GATE_TARGET], [[GATE.x + 5, 6, GATE.z + 11], GATE_TARGET]], progress, state);
}

function stepsAutomated({ progress }) {
  const bridged = share(progress, 0.05, 0.45);
  const handedOver = progress > 0.5;
  const gaps = { ...GATED.gaps, ...(bridged === 1 && { A2: 'closed' }), ...(handedOver && { A3: 'robot' }) };
  const builders = [GAPS.A.start + 0.8, GAPS.A.end - 0.8].map((x, index) => (
    { role: 'builder', x, z: LANES[1] + 1.4, facing: index ? -1 : 1 }
  ));
  const robot = { role: 'robot', x: middleOf(GAPS.A), z: between(LANES[2] + 6, LANES[2], share(progress, 0.3, 0.5)) };
  const carrier = { role: 'carrier', promoted: share(progress, 0.5, 0.65), ...walkOff(share(progress, 0.65, 1)) };
  const crew = [...(bridged < 1 ? builders : []), handedOver ? carrier : robot];
  const growing = bridged < 1 && { gap: 'A', lane: 1, share: bridged };
  return shot([MIDDLE, [[2, 11, 15], [1, 1, -1.5]]], progress, { ...START, gaps, crew, growing });
}

// The Carrier who handed a stretch to a robot walks on to the next gate as a Builder.
function walkOff(walked) {
  const from = { x: GAPS.A.end + 0.6, z: LANES[2] + 1.3 };
  const to = { x: middleOf(GAPS.B) - 1.2, z: LANES[2] + 1.4 };
  return { x: between(from.x, to.x, walked), z: between(from.z, to.z, walked), facing: 1 };
}
