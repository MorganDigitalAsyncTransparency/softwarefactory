// One factory layout for every scene, in metres, so the camera can move without the
// world changing (visual-descriptions.md, continuity). Flow runs along +x, left to right:
// from the office, ten small belts are joined in pairs into five, and the five into one.
export const OFFICE = { start: -50, end: -33, back: -13, front: 11 };
export const HALL = { left: -32, right: 32, back: -16, front: 12, height: 9 };
export const LANES = [-7.3, -4.1, -0.9, 2.3, 5.5];
export const PAIR = 0.75;
export const INTAKE = { start: -40, end: -14, width: 0.9 };
export const JOINER = { start: -14, end: -12 };
export const BELT = { start: -12, end: 12, width: 1.6, height: 1 };
export const GAPS = { A: { start: -6, end: -2 }, B: { start: 3, end: 7 } };
export const INTAKE_TESTS = [-26, -19];
export const TESTS = [-9, 0.5];
export const ASSEMBLY = { start: 12, end: 17 };
export const OUTPUT = { start: 15, end: 37.5, z: -0.9 };
export const OUTPUT_TESTS = [21, 27];
export const DOCK = { start: 32, end: 38 };
export const USERS = [[38.8, -2.8], [39.6, -0.6], [38.9, 1.4]];
export const CLOUD = { x: 0, y: 21, z: -9 };
export const CRANE = { x: 12, z: -23, height: 24, reach: 26 };
// The server room talks to the cloud and to the stations near it.
export const SERVER_ROOM = {
  start: 24, end: 31.6, back: 5, front: 11, port: { x: 27.6, y: 2.9, z: 8.4 }, stations: ['output 0 0', 'output 0 1'],
};
export const SPEED = 2;
// Where people walk about and work: rectangles of floor between the desks and machines,
// among them the walkways between the five belts, past their test stations.
export const AISLES = {
  office: { x: [-43.6, -42.4], z: [-11, 10] },
  front: { x: [-30, 22], z: [8.5, 10.5] },
  serverRoom: { x: [24.8, 30.6], z: [9.7, 10.4] },
  back: { x: [-30, 30], z: [-13.5, -10.5] },
  ...Object.fromEntries(LANES.slice(1).map((z, index) => [`between${index}`, { x: [-4.3, 0.9], z: [z - 1.65, z - 1.55] }])),
};
// The share of the hall and of the last piece of each unfinished belt that stands at the
// start of the film and at its end: the factory is never finished.
const HALL_BUILT = [0.3, 0.95];
const BELTS_LAID = { 0: [0.4, 0.65], 4: [0.2, 0.6] };
// Where the developers laying a belt stand, past its end.
export const BELT_WORKERS = [0.4, 1.4];
const RACKS_BUILT = [4.6, 7.6];
// Test stations that are still being built, by `kind laneIndex index`, as shares built at
// the film's start and end; past 1 a station is finished earlier. About a third of all.
const STATIONS_BUILT = {
  'intake 1 1': [0.2, 1.6], 'intake 3 1': [0.5, 1.2], 'intake 4 0': [0.1, 0.9],
  'middle 0 1': [0.3, 0.8], 'middle 2 1': [0.15, 1.4], 'middle 4 1': [0.4, 2],
  'output 0 1': [0.25, 0.95],
};

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

// The factory is built all through the film: the share of the hall that stands, and
// where each unfinished belt ends, when `filmShare` of the film has played.
export function hallBuilt(filmShare) {
  return grown(HALL_BUILT, filmShare);
}

export function beltsLaid(filmShare) {
  return Object.fromEntries(Object.entries(BELTS_LAID).map(([laneIndex, laid]) => (
    [laneIndex, GAPS.B.end + (BELT.end - GAPS.B.end) * grown(laid, filmShare)]
  )));
}

// How many server racks stand in the cloud: it grows all through the film, too.
export function racksBuilt(filmShare) {
  return grown(RACKS_BUILT, filmShare);
}

export function stationBuilt(key, filmShare) {
  return key in STATIONS_BUILT ? Math.min(1, grown(STATIONS_BUILT[key], filmShare)) : 1;
}

export function unfinishedStations() {
  return Object.keys(STATIONS_BUILT);
}

function grown([first, last], filmShare) {
  return first + (last - first) * filmShare;
}

// A repeatable pseudo-random value in [0, 1), so irregular motion is the same on every
// play and every seek.
export function noise(seed) {
  const value = Math.sin(seed * 12.9898 + 4.1414) * 43758.5453;
  return value - Math.floor(value);
}
