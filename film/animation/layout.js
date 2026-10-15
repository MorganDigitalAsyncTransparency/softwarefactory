// One factory layout for every scene, so the camera can move without the world changing
// (visual-descriptions.md, continuity).
export const FRAME = { x: 0, y: 0, width: 1600, height: 900 };
export const FLOOR = { x: 40, y: 250, width: 1430, height: 610 };
export const LANES = [380, 480, 580, 680];
export const BELT_START = 90;
export const BELT_END = 1110;
export const BELT_HEIGHT = 34;
export const GAPS = { A: { start: 660, end: 740 }, B: { start: 900, end: 980 } };
export const SCANNER_X = 600;
export const ASSEMBLY = { x: 1110, y: 340, width: 70, height: 380 };
export const OUTPUT = { y: 530, start: 1180, end: 1340 };
export const DOCK = { x: 1340, y: 480, width: 100, height: 100 };
export const USERS = [{ x: 1500, y: 520 }, { x: 1540, y: 560 }, { x: 1575, y: 505 }];
export const CLOUD = { x: 800, y: 95 };
export const SCAFFOLD = { start: 900, end: 1470, y: 250 };
export const CABLE_ENDS = [
  { x: SCANNER_X, y: 345 },
  { x: 700, y: 345 },
  { x: 940, y: 345 },
  { x: ASSEMBLY.x + ASSEMBLY.width / 2, y: ASSEMBLY.y },
  { x: DOCK.x + DOCK.width / 2, y: DOCK.y },
];
export const BELT_SPEED = 70;

export function gapKey(gap, laneIndex) {
  return `${gap}${laneIndex + 1}`;
}

// A repeatable pseudo-random value in [0, 1), so irregular motion is the same on every
// play and every seek.
export function noise(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

export function pingPong(phase) {
  const position = phase - Math.floor(phase);
  return position < 0.5 ? position * 2 : 2 - position * 2;
}
