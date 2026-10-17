import { share } from './timeline.js';
import { BELT, GAPS, INTAKE, JOINER, NEW_LANE, TESTS } from './layout.js';

// When each part of the factory is built, as R10 in docs/02-REQUIREMENTS.md asks.
// Every value is a share of the film played (`buildShare` in player.js): 0 is the
// first frame and 1 the last. A start below 0 means the part was begun before the
// film; an end above 1 means it is still unfinished when the film ends.

// The share of the hall that stands, how far the last piece of each unfinished belt is
// laid, and how many racks stand in the cloud and in the server room.
const HALL_BUILT = [0.15, 0.95];
const BELTS_LAID = { 0: [0.1, 0.65], 4: [0.02, 0.6] };
const RACKS_BUILT = [2.6, 7.6];
// How many racks in the cloud IT has fitted for the new boxes, one after the other, from
// the time the viewer has seen what the pink band means.
const RACKS_FITTED = { from: 0.4, count: 3 };
const ROOM_RACKS_BUILT = [1, 2.7];
// The sixth lane is laid in order: its small belts, the joiner, then its belt.
const NEW_LANE_LAID = { intake: [0, 0.42], joiner: [0.42, 0.5], middle: [0.5, 1.15] };
// Builds in the lines that crawl, beside the ones above that finish fast: how much of a
// carried gap is laid with belt, and how far a gate has risen, from the first frame to
// the last.
const SLOW_BELTS = { A1: [0.05, 0.3], B5: [0.1, 0.32] };
const CRAWLING_GATE_RISEN = [0.2, 0.45];
// Test stations built during the film, by `kind laneIndex index`, one after the other.
const STATIONS_BUILT = {
  'intake 1 1': [-0.1, 0.08], 'middle 0 1': [-0.06, 0.12], 'intake 2 2': [0.02, 0.19],
  'middle 1 2': [0.1, 0.27], 'intake 4 2': [0.18, 0.35], 'output 0 2': [0.26, 0.43],
  'intake 0 2': [0.34, 0.51], 'intake 1 2': [0.38, 0.55], 'intake 5 0': [0.44, 0.61],
  'middle 3 2': [0.52, 0.69], 'intake 5 1': [0.58, 0.75], 'middle 5 0': [0.66, 0.83],
  'intake 3 2': [0.74, 0.91], 'middle 2 2': [0.82, 0.99], 'middle 5 1': [0.87, 1.04],
  'intake 5 2': [0.92, 1.09],
};

// The stations along the belt of a lane: a lane that is still being laid has no third
// station at its far end yet.
export function middleTests(laneIndex) {
  return laneIndex in BELTS_LAID || laneIndex === NEW_LANE.index ? TESTS.slice(0, 2) : TESTS;
}

export function hallBuilt(buildShare) {
  return grown(HALL_BUILT, buildShare);
}

// Where each unfinished belt ends.
export function beltsLaid(buildShare) {
  return Object.fromEntries(Object.entries(BELTS_LAID).map(([laneIndex, laid]) => (
    [laneIndex, GAPS[laneIndex].B.end + (BELT.end - GAPS[laneIndex].B.end) * grown(laid, buildShare)]
  )));
}

export function racksBuilt(buildShare) {
  return grown(RACKS_BUILT, buildShare);
}

export function racksFitted(buildShare) {
  return RACKS_FITTED.count * share(buildShare, RACKS_FITTED.from, 1);
}

export function roomRacksBuilt(buildShare) {
  return grown(ROOM_RACKS_BUILT, buildShare);
}

// The share of each slowly laid gap, by `gapKey` in layout.js, that is laid with belt.
export function gapsLaid(buildShare) {
  return Object.fromEntries(Object.entries(SLOW_BELTS).map(([key, laid]) => [key, grown(laid, buildShare)]));
}

// How far the posts of the crawling gate (CRAWLING_GATE in layout.js) have risen.
export function gateRisen(buildShare) {
  return grown(CRAWLING_GATE_RISEN, buildShare);
}

export function stationBuilt(key, buildShare) {
  return key in STATIONS_BUILT ? share(buildShare, ...STATIONS_BUILT[key]) : 1;
}

export function stationsBuiltDuringFilm() {
  return Object.keys(STATIONS_BUILT);
}

export function stationReady(key) {
  return STATIONS_BUILT[key][1];
}

// How far the new lane's small belts and its belt are laid, and how far its joiner has risen.
export function newLaneLaid(buildShare) {
  const { intake, joiner, middle } = NEW_LANE_LAID;
  return {
    intake: INTAKE.start + (INTAKE.end - INTAKE.start) * share(buildShare, ...intake),
    joiner: share(buildShare, ...joiner),
    middle: JOINER.end + (BELT.end - JOINER.end) * share(buildShare, ...middle),
  };
}

function grown([first, last], buildShare) {
  return first + (last - first) * buildShare;
}
