// One factory layout for every scene, in metres, so the camera can move without the
// world changing (visual-descriptions.md, continuity). Flow runs along +x, left to right.
export const HALL = { left: -32, right: 32, back: -16, front: 12, height: 9 };
export const LANES = [-7.5, -3, 1.5, 6];
export const BELT = { start: -31, end: 12, width: 1.6, height: 1 };
export const GAPS = { A: { start: -6, end: -2 }, B: { start: 3, end: 7 } };
export const SCANNER_X = -20;
export const ASSEMBLY = { start: 12, end: 17 };
export const OUTPUT = { start: 15, end: 37.5, z: -0.75 };
export const DOCK = { start: 32, end: 38 };
export const USERS = [[38.8, -2.6], [39.6, -0.4], [38.9, 1.6]];
export const CLOUD = { x: 0, y: 21, z: -9 };
export const SPEED = 2;

export function gapKey(gap, laneIndex) {
  return `${gap}${laneIndex + 1}`;
}

export function middleOf({ start, end }) {
  return (start + end) / 2;
}

// A repeatable pseudo-random value in [0, 1), so irregular motion is the same on every
// play and every seek.
export function noise(seed) {
  const value = Math.sin(seed * 12.9898 + 4.1414) * 43758.5453;
  return value - Math.floor(value);
}
