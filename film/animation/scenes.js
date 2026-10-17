import { FITTING_SECONDS, between } from './flow.js';
import { CREW_SIDE, DOCK, GAPS, LANES, OUTPUT, middleOf } from './layout.js';
import { share } from './timeline.js';

// Cameras are [position, target] in metres. The film is one continuous picture, so each
// scene's camera starts where the one before it stopped.
const HIGH = [[-44, 92, 132], [-6, 12, -3]];
const OVERVIEW = [[-6, 56, 76], [-6, 7, -3]];
const OFFICE_VIEW = [[-33, 14, 20], [-43, 1, -1]];
const SITE_VIEW = [[-2, 20, 16], [-2, 4, -12]];
const CLOUD_VIEW = [[18, 34, 64], [10, 11, -2]];
const SETTLED = [[-6, 50, 72], [-6, 6.5, -3]];
const LEFT = [[-22, 17, 22], [-27, 1, -1]];
const DOOR_VIEW = [[DOCK.start - 10, 12, 21], [DOCK.start - 6, 1.5, OUTPUT.z]];
const DOCK_VIEW = [[DOCK.end - 2, 8, 17], [DOCK.end - 1, 1.5, OUTPUT.z]];
const MIDDLE = [[1, 13, 18], [1, 1, -1.5]];
const MIDDLE_CLOSE = [[0, 10, 14], [0, 1, -1.5]];
const MIDDLE_HIGH = [[1, 17, 22], [1, 1, -2]];
const OUTAGE_VIEW = [[-2, 40, 52], [-2, 8, -4]];
const FAREWELL = [[-14, 66, 92], [-6, 9, -3]];
const GATE = { x: middleOf(GAPS[1].B), z: LANES[1] };
const GATE_WIDE = [[GATE.x + 7, 7, GATE.z + 13], [GATE.x - 0.5, 1.3, GATE.z]];
const GATE_CLOSE = [[GATE.x + 5, 6, GATE.z + 11], [GATE.x - 0.5, 1.3, GATE.z]];
const START = { gaps: {}, fitted: {}, reveal: 1, digital: 0, crew: [] };
// Gates fitted for new boxes, by the film time from which they pass them. The gate built
// in the gate scene counts as fitted from the start once the boxes it held are gone.
const GATED = { ...START, gaps: { B2: 'gate' }, fitted: { B2: 0 } };
const AUTOMATED = { ...GATED, gaps: { ...GATED.gaps, A2: 'closed', A3: 'robot' } };
const TODAY = {
  ...START,
  gaps: { ...AUTOMATED.gaps, B1: 'gate', A4: 'closed', B4: 'gate' },
  // One of the new gates is not yet fitted for new boxes: IT is always catching up.
  fitted: { ...GATED.fitted, B4: 0 },
  crew: [
    { role: 'factory', x: middleOf(GAPS[2].B) - 1, z: LANES[2] - CREW_SIDE, facing: 1 },
    { role: 'factory', x: middleOf(GAPS[2].B) + 1, z: LANES[2] - CREW_SIDE, facing: -1 },
    { role: 'it', x: middleOf(GAPS[2].B), z: LANES[2] - CREW_SIDE, facing: 0 },
  ],
};
// While the cloud is down, in this share of the outage scene, the line stands still
// and the people hurry about, this many times their usual pace, to find out why.
const OUTAGE = [0.2, 0.7];
const RUSH = 2.5;
// The end of the gate scene, in seconds before it ends: the Product developer walks
// over, asks and the IT developer answers, then lowers the adapter until the gate is fitted.
const FITTED = 0.8;
const TALK = { walk: [7.3, 4.8], ask: [4.1, 3.4], answer: [3.4, FITTED + FITTING_SECONDS] };

// Each drawing returns the shot for one frame: a camera path, the world's state and
// whether the picture fades from or to black at the scene's edges.
const DRAWINGS = {
  S01: ({ progress }) => ({ ...shot([HIGH, OVERVIEW], progress, { ...START, reveal: progress / 0.85 }), fades: ['in'] }),
  S02: ({ progress }) => shot([OVERVIEW, OFFICE_VIEW], progress, START),
  S03: ({ progress }) => shot([OFFICE_VIEW, SITE_VIEW], progress, START),
  S04: ({ progress }) => shot([SITE_VIEW, CLOUD_VIEW], progress, START),
  S05: ({ progress }) => shot([CLOUD_VIEW, SETTLED], progress, START),
  S06: ({ progress }) => shot([SETTLED, LEFT], progress, START),
  S07: ({ progress }) => shot([LEFT, DOOR_VIEW, DOCK_VIEW], progress, START),
  S08: ({ progress }) => shot([DOCK_VIEW, DOOR_VIEW, MIDDLE], progress, START),
  S09: ({ progress }) => ({ ...shot([MIDDLE, MIDDLE_CLOSE], progress, START), fades: ['out'], uneven: true }),
  S10: ({ progress }) => ({ split: true, progress, fades: ['in', 'out'] }),
  S11: ({ progress }) => ({ ...cloudFails(progress), fades: ['in'], halts: OUTAGE }),
  S12: gateInstalled,
  S13: stepsAutomated,
  S14: ({ progress }) => shot([MIDDLE, MIDDLE_HIGH], progress, { ...AUTOMATED, digital: share(progress, 0, 0.7) }),
  S15: ({ progress }) => shot([MIDDLE_HIGH, OVERVIEW], progress, { ...TODAY, digital: 1 - share(progress, 0, 0.35) }),
  S16: ({ progress }) => ({ ...shot([OVERVIEW, FAREWELL], progress, TODAY), fades: ['out'] }),
};

// The belts' own clock: film time without the seconds the line stood still, in the
// share of each scene its drawing `halts`, so every box and robot stops where it was
// and goes on from there.
export function lineTime(scenes, time) {
  return time - haltedSeconds(scenes, time);
}

// The people's clock runs faster while the line stands still: they keep working and
// hurry about.
export function peopleTime(scenes, time) {
  return time + (RUSH - 1) * haltedSeconds(scenes, time);
}

function haltedSeconds(scenes, time) {
  return scenes.reduce((halted, scene) => {
    const { halts } = draw({ scene, progress: 0 });
    if (!halts) return halted;
    const [from, to] = halts.map((at) => scene.start + at * (scene.end - scene.start));
    return halted + share(time, from, to) * (to - from);
  }, 0);
}

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

// The overview while a service in the cloud fails and comes back, then down to the gate.
function cloudFails(progress) {
  const state = { ...START, outage: progress >= OUTAGE[0] && progress < OUTAGE[1] };
  if (progress < 0.75) return shot([OVERVIEW, OUTAGE_VIEW], progress / 0.75, state);
  return shot([OUTAGE_VIEW, GATE_WIDE], share(progress, 0.75, 1), state);
}

// The gate is installed, but it cannot check the new boxes: they wait at it with an
// amber light. A Product developer comes over and asks the IT developer, who answers and
// fits the gate with an adapter, and from then on new boxes pass.
function gateInstalled({ scene, progress }) {
  const installed = progress > 0.4;
  const left = (1 - progress) * (scene.end - scene.start);
  const crew = [
    { role: 'factory', x: GATE.x - 1.6, z: GATE.z - CREW_SIDE, facing: 1 },
    { role: 'factory', x: GATE.x + 1.6, z: GATE.z - CREW_SIDE, facing: -1 },
    { role: 'it', x: GATE.x - 0.5, z: GATE.z - CREW_SIDE, facing: 0, ...(talking(left, TALK.answer) && { says: 'adapter' }) },
  ];
  if (!installed) return shot([GATE_WIDE, GATE_CLOSE], progress, { ...START, crew, installing: { gap: 'B', lane: 1, share: share(progress, 0, 0.4) } });
  const asker = { role: 'product', ...askerAt(done(left, TALK.walk)), ...(talking(left, TALK.ask) && { says: 'new' }) };
  const state = { ...GATED, crew: [...crew, asker], fitted: { B2: scene.end - FITTED } };
  return shot([GATE_WIDE, GATE_CLOSE], progress, state);
}

// How far an action from `from` to `to` seconds before the scene ends has come, `left`
// seconds before it ends.
function done(left, [from, to]) {
  return share(from - left, 0, from - to);
}

function talking(left, window) {
  const talked = done(left, window);
  return talked > 0 && talked < 1;
}

// The Product developer walks up beside the IT developer at the gate.
function askerAt(walked) {
  const x = between(GATE.x + 4, GATE.x + 0.5, walked);
  return { x, z: GATE.z - CREW_SIDE - 0.6, facing: -1, walking: walked < 1 };
}

// Right after the gate scene, the gate passes only the new boxes that reach it after it
// was fitted, so none in its bin jumps back onto the belt.
function stepsAutomated({ scene, progress }) {
  const bridged = share(progress, 0.05, 0.45);
  const handedOver = progress > 0.5;
  const gaps = { ...GATED.gaps, ...(bridged === 1 && { A2: 'closed' }), ...(handedOver && { A3: 'robot' }) };
  const developers = [GAPS[1].A.start + 0.8, GAPS[1].A.end - 0.8].map((x, index) => (
    { role: 'factory', x, z: LANES[1] - CREW_SIDE, facing: index ? -1 : 1 }
  ));
  const robot = { role: 'robot', x: middleOf(GAPS[2].A), z: between(LANES[2] - CREW_SIDE, LANES[2], share(progress, 0.3, 0.5)) };
  const carrier = { role: 'product', walking: true, ...walkOff(share(progress, 0.55, 1)) };
  const crew = [...(bridged < 1 ? developers : []), handedOver ? carrier : robot];
  const growing = bridged < 1 && { gap: 'A', lane: 1, share: bridged };
  return shot([GATE_CLOSE, MIDDLE], progress, { ...GATED, gaps, crew, growing, fitted: { B2: scene.start - FITTED } });
}

// The Product developer who handed a stretch to a robot walks off toward the office.
function walkOff(walked) {
  const from = { x: GAPS[2].A.end + 0.6, z: LANES[2] + 1.05 };
  const to = { x: GAPS[2].A.start - 1.5, z: LANES[2] + 1.05 };
  return { x: between(from.x, to.x, walked), z: between(from.z, to.z, walked), facing: -1 };
}
