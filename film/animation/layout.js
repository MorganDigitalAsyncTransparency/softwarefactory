// One factory layout for every scene, in metres, so the camera can move without the
// world changing (visual-descriptions.md, continuity). Flow runs along +x, left to right:
// ten small belts are joined in pairs into five, and the five into one.
export const HALL = { left: -32, right: 32, back: -16, front: 12, height: 9 };
export const LANES = [-7.3, -4.1, -0.9, 2.3, 5.5];
export const PAIR = 0.75;
export const INTAKE = { start: -31, end: -14, width: 0.9 };
export const JOINER = { start: -14, end: -12 };
export const BELT = { start: -12, end: 12, width: 1.6, height: 1 };
export const GAPS = { A: { start: -6, end: -2 }, B: { start: 3, end: 7 } };
export const INTAKE_TESTS = [-26, -19];
export const TESTS = [-9, 9.5];
export const UNFINISHED_LANE = 4;
export const ASSEMBLY = { start: 12, end: 17 };
export const OUTPUT = { start: 15, end: 37.5, z: -0.9 };
export const OUTPUT_TESTS = [21, 27];
export const DOCK = { start: 32, end: 38 };
export const USERS = [[38.8, -2.8], [39.6, -0.6], [38.9, 1.4]];
export const CLOUD = { x: 0, y: 21, z: -9 };
export const CRANE = { x: 12, z: -23, height: 24, reach: 26 };
export const SPEED = 2;

export function gapKey(gap, laneIndex) {
  return `${gap}${laneIndex + 1}`;
}

export function middleOf({ start, end }) {
  return (start + end) / 2;
}

// The two small belts that are joined into middle belt `laneIndex`.
export function smallLanes(laneIndex) {
  return [LANES[laneIndex] - PAIR, LANES[laneIndex] + PAIR];
}

// The factory is built all through the film and never finished: the share of the hall
// that stands, and how far the unfinished belt reaches, at a time in seconds.
export function hallBuilt(time) {
  return 0.3 + time * 0.0045;
}

export function beltLaid(time) {
  return GAPS.B.end + (BELT.end - GAPS.B.end) * (0.2 + time * 0.0055);
}

// A repeatable pseudo-random value in [0, 1), so irregular motion is the same on every
// play and every seek.
export function noise(seed) {
  const value = Math.sin(seed * 12.9898 + 4.1414) * 43758.5453;
  return value - Math.floor(value);
}
