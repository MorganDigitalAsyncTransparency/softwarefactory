// One factory layout for every scene, in metres, so the camera can move without the
// world changing (visual-descriptions.md, continuity). Flow runs along +x, left to right:
// from the office, ten small belts are joined in pairs into five, and the five into one.
// A sixth lane is laid in front of them during the film.
export const OFFICE = { start: -50, end: -33, back: -13, front: 11 };
export const HALL = { left: -32, right: 32, back: -16, front: 12, height: 9 };
export const LANES = [-7.3, -4.1, -0.9, 2.3, 5.5];
export const PAIR = 0.75;
export const INTAKE = { start: -40, end: -14, width: 0.9 };
export const JOINER = { start: -14, end: -12 };
export const BELT = { start: -12, end: 12, width: 1.6, height: 1 };
// The two gaps in the middle of each lane, carried by hand until they are closed. They
// lie and measure a little differently on every lane, as on a real floor.
export const GAPS = [
  { A: { start: -6, end: -2.5 }, B: { start: 2, end: 6.5 } },
  { A: { start: -5.5, end: -2 }, B: { start: 3, end: 7 } },
  { A: { start: -6.5, end: -3 }, B: { start: 3.5, end: 8 } },
  { A: { start: -5, end: -1 }, B: { start: 2.5, end: 5.5 } },
  { A: { start: -6, end: -3.5 }, B: { start: 1.5, end: 6 } },
];
// The third station on each pair of small belts is built during the film.
export const INTAKE_TESTS = [-26, -19, -22.5];
export const INTAKE_SPAN = 2 * PAIR + INTAKE.width + 0.4;
export const TESTS = [-9, 0.5, 9.5];
export const TEST_SPAN = 2.2;
export const ASSEMBLY = { start: 12, end: 17 };
export const OUTPUT = { start: 15, end: 37.5, z: -0.9 };
export const OUTPUT_TESTS = [21, 24, 27];
// The red lights in the split panels come on at this share of their scene.
export const PANEL_WARNING_AT = 0.7;
export const DOCK = { start: 32, end: 38 };
export const USERS = [[38.8, -2.8], [39.6, -0.6], [38.9, 1.4]];
export const CLOUD = { x: 0, y: 21, z: -9 };
// The crane lifts a panel every `liftSeconds` and sets it on the wall at `setAt` of a lift.
export const CRANE = { x: 12, z: -23, height: 24, reach: 26, liftSeconds: 10, setAt: 0.8 };
// The server room talks to the cloud and to the stations near it.
const ROOM_RACKS = [25.6, 27.6, 29.6];
export const SERVER_ROOM = {
  start: 24, end: 31.6, back: 5, front: 11, racks: ROOM_RACKS, port: { x: ROOM_RACKS[0], y: 2.9, z: 8.4 },
  stations: ['output 0 0', 'output 0 1', 'output 0 2'],
};
// The sixth lane, laid during the film in front of the others.
export const NEW_LANE = { index: 5, z: 8.7 };
export const ALL_LANES = [...LANES, NEW_LANE.z];
export const SPEED = 2;
// Where people walk about and work: rectangles of floor between the desks and machines,
// among them the walkways between the five belts, past their first test stations and
// short of the joiners and of the piles at the gaps.
export const AISLES = {
  office: { x: [-43.6, -42.4], z: [-11, 10] },
  front: { x: [-30, 22], z: [10.9, 11.5] },
  serverRoom: { x: [24.8, 30.6], z: [10.2, 10.6] },
  back: { x: [-30, 30], z: [-13.5, -10.5] },
  ...Object.fromEntries(LANES.slice(1).map((z, index) => [`between${index}`, { x: [-11.4, -6.4], z: [z - 1.65, z - 1.55] }])),
};
// Where the developers laying a belt stand, past its end.
export const BELT_WORKERS = [0.4, 1.4];

export function gapKey(gap, laneIndex) {
  return `${gap}${laneIndex + 1}`;
}

export function middleOf({ start, end }) {
  return (start + end) / 2;
}

// The two small belts that are joined into middle belt `laneIndex`.
export function smallLanes(laneIndex) {
  return [ALL_LANES[laneIndex] - PAIR, ALL_LANES[laneIndex] + PAIR];
}

// A repeatable pseudo-random value in [0, 1), so irregular motion is the same on every
// play and every seek.
export function noise(seed) {
  const value = Math.sin(seed * 12.9898 + 4.1414) * 43758.5453;
  return value - Math.floor(value);
}
