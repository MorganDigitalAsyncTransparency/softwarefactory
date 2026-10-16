import { between } from './flow.js';
import { DOCK, GAPS, LANES, OUTPUT, middleOf } from './layout.js';
import { share } from './timeline.js';

// Cameras are [position, target] in metres. The film is one continuous picture, so each
// scene's camera starts where the one before it stopped.
const HIGH = [[-34, 80, 118], [3, 12, -3]];
const OVERVIEW = [[4, 47, 62], [3, 8.5, -3]];
const SETTLED = [[2, 42, 55], [2, 7.5, -3]];
const LEFT = [[-17, 17, 21], [-22, 1, -1]];
const DOOR_VIEW = [[DOCK.start - 10, 12, 21], [DOCK.start - 6, 1.5, OUTPUT.z]];
const DOCK_VIEW = [[DOCK.end - 2, 8, 17], [DOCK.end - 1, 1.5, OUTPUT.z]];
const MIDDLE = [[1, 13, 18], [1, 1, -1.5]];
const MIDDLE_CLOSE = [[0, 10, 14], [0, 1, -1.5]];
const MIDDLE_HIGH = [[1, 17, 22], [1, 1, -2]];
const FAREWELL = [[-8, 62, 84], [3, 9, -3]];
const GATE = { x: middleOf(GAPS.B), z: LANES[1] };
const GATE_WIDE = [[GATE.x + 7, 7, GATE.z + 13], [GATE.x - 0.5, 1.3, GATE.z]];
const GATE_CLOSE = [[GATE.x + 5, 6, GATE.z + 11], [GATE.x - 0.5, 1.3, GATE.z]];
const START = { gaps: {}, reveal: 1, digital: 0, crew: [] };
const GATED = { ...START, gaps: { B2: 'gate' } };
const AUTOMATED = { ...START, gaps: { ...GATED.gaps, A2: 'closed', A3: 'robot' } };
const TODAY = {
  ...START,
  gaps: { ...AUTOMATED.gaps, B1: 'gate', A4: 'closed', B4: 'gate' },
  crew: [
    { role: 'builder', x: middleOf(GAPS.B) - 1, z: LANES[2] + 1.4, facing: 1 },
    { role: 'builder', x: middleOf(GAPS.B) + 1, z: LANES[2] + 1.4, facing: -1 },
    { role: 'infrastructure', x: middleOf(GAPS.B), z: LANES[2] - 1.4, facing: 0 },
  ],
};

// Each drawing returns the shot for one frame: a camera path, the world's state and
// whether the picture fades from or to black at the scene's edges.
const DRAWINGS = {
  S01: ({ progress }) => ({ ...shot([HIGH, OVERVIEW], progress, { ...START, reveal: progress / 0.85 }), fades: ['in'] }),
  S02: ({ progress }) => shot([OVERVIEW, SETTLED], progress, START),
  S03: ({ progress }) => shot([SETTLED, LEFT], progress, START),
  S04: ({ progress }) => shot([LEFT, DOOR_VIEW, DOCK_VIEW], progress, START),
  S05: ({ progress }) => shot([DOCK_VIEW, DOOR_VIEW, MIDDLE], progress, START),
  S06: ({ progress }) => ({ ...shot([MIDDLE, MIDDLE_CLOSE], progress, START), fades: ['out'] }),
  S07: ({ progress }) => ({ split: true, progress, fades: ['in', 'out'] }),
  S08: (frame) => ({ ...gateInstalled(frame), fades: ['in'] }),
  S09: stepsAutomated,
  S10: ({ progress }) => shot([MIDDLE, MIDDLE_HIGH], progress, { ...AUTOMATED, digital: share(progress, 0, 0.7) }),
  S11: ({ progress }) => shot([MIDDLE_HIGH, OVERVIEW], progress, { ...TODAY, digital: 1 - share(progress, 0, 0.35) }),
  S12: ({ progress }) => ({ ...shot([OVERVIEW, FAREWELL], progress, TODAY), fades: ['out'] }),
};

export function checkDrawings(scenes) {
  scenes.forEach(({ id }) => {
    if (!DRAWINGS[id]) throw new Error(`Scene ${id} has no drawing in film/animation/scenes.js.`);
  });
}

export function draw(frame) {
  return DRAWINGS[frame.scene.id](frame);
}

// The camera glides along its path, easing in at the start and out at the end.
function shot(path, progress, state) {
  const along = between(0, path.length - 1, progress);
  const index = Math.min(Math.floor(along), path.length - 2);
  const [from, to] = [path[index], path[index + 1]];
  const camera = from.map((point, part) => point.map((value, axis) => value + (to[part][axis] - value) * (along - index)));
  return { camera, state };
}

function gateInstalled({ progress }) {
  const installed = progress > 0.4;
  const crew = [
    { role: 'builder', x: GATE.x - 1.6, z: GATE.z + 1.4, facing: 1 },
    { role: 'builder', x: GATE.x + 1.6, z: GATE.z + 1.4, facing: -1 },
    { role: 'infrastructure', x: GATE.x + 0.4, z: GATE.z - 1.4, facing: 0 },
  ];
  const state = installed ? { ...GATED, crew } : { ...START, crew, installing: { gap: 'B', lane: 1, share: share(progress, 0, 0.4) } };
  return shot([GATE_WIDE, GATE_CLOSE], progress, state);
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
  return shot([GATE_CLOSE, MIDDLE], progress, { ...START, gaps, crew, growing });
}

// The Carrier who handed a stretch to a robot walks on to the next gate as a Builder.
function walkOff(walked) {
  const from = { x: GAPS.A.end + 0.6, z: LANES[2] + 1.3 };
  const to = { x: middleOf(GAPS.B) - 1.2, z: LANES[2] + 1.4 };
  return { x: between(from.x, to.x, walked), z: between(from.z, to.z, walked), facing: 1 };
}
