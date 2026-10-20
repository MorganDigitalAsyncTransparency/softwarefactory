import { share } from './timeline.js';
import { LANES, SERVER_ROOM } from './layout.js';
import { stationBuilt, stationReady, stationsBuiltDuringFilm } from './schedule.js';

// Communication in the factory is access controlled: the cable to a test station ends in
// a lock. Every value is a share of the film played, as in schedule.js.

// Now and then an IT security developer tightens the access of a station at its lock,
// and the station is denied and stops testing, so boxes pass it unchecked, until an IT
// developer puts it right. Small and local, unlike the cloud outage. Each falls in a
// scene that shows it (tests/access.test.js).
const CHANGES = {
  'middle 0 0': [0.127, 0.16],
  'middle 0 1': [0.417, 0.457],
  'intake 2 0': [0.907, 0.947],
};
// Who comes to a stop, in order, from which share of it: the IT security developer who
// made it, a Product developer to wait, and an IT developer for the last part.
const IT_COMES = 0.55;
const ARRIVALS = [['security', 0], ['product', 0.25], ['it', IT_COMES]];
// In the scene that introduces them, IT security developers raise a firewall by the
// server room, and its finished stations are denied together until an IT developer
// comes, for the last part, to open the way.
const FIREWALL = { rises: [0.236, 0.246], denied: [0.243, 0.267] };
// New stations that wait this long for their access after they are built.
const WAITING = { 'middle 1 2': 0.06, 'middle 3 2': 0.09 };
// Who tries the card reader by the server room, and when.
const VISITS = [
  { role: 'it', at: [0.167, 0.183] },
  { role: 'product', at: [0.186, 0.208] },
];

// The stations a cable runs to: the first on every belt, those of the server room and
// those built during the film.
export function cabledStations() {
  const first = LANES.flatMap((_, laneIndex) => [`intake ${laneIndex} 0`, `middle ${laneIndex} 0`]);
  return new Set([...first, ...SERVER_ROOM.stations, ...stationsBuiltDuringFilm()]);
}

// 'granted', 'denied' while an access is wrong, or 'waiting' for a new station's first access.
export function accessAt(key, buildShare) {
  if (key in CHANGES && inside(buildShare, CHANGES[key])) return 'denied';
  if (firewalled(key, buildShare)) return 'denied';
  if (key in WAITING && inside(buildShare, [stationReady(key), stationReady(key) + WAITING[key]])) return 'waiting';
  return 'granted';
}

// While an access change holds, the IT security developer who made it works at the lock,
// a Product developer comes to wait, and later an IT developer comes to fix it.
export function deniedCrew(key, buildShare) {
  if (!(key in CHANGES) || !inside(buildShare, CHANGES[key])) return [];
  return arrived(share(buildShare, ...CHANGES[key]));
}

// How far the firewall by the server room has risen, and who is at it: the IT security
// developer who raised it, and an IT developer for the last part of the stop.
export function firewallAt(buildShare) {
  const crewed = inside(buildShare, [FIREWALL.rises[0], FIREWALL.denied[1]]);
  const itCame = share(buildShare, ...FIREWALL.denied) >= IT_COMES;
  const crew = crewed ? ['security', ...(itCame ? ['it'] : [])] : [];
  return { risen: share(buildShare, ...FIREWALL.rises), crew };
}

function arrived(done) {
  return ARRIVALS.filter(([, from]) => done >= from).map(([role]) => role);
}

// Who stands at the card reader, and what it shows once they have tried their card: it
// lets IT developers in, after a second step on its keypad, and no one else.
export function readerVisit(buildShare) {
  const visit = VISITS.find(({ at }) => inside(buildShare, at));
  if (!visit) return null;
  const tried = share(buildShare, ...visit.at);
  return { role: visit.role, light: tried > 0.5 && readerLight(visit.role, tried) };
}

function readerLight(role, tried) {
  if (role !== 'it') return 'stop';
  return tried < 0.75 ? 'wait' : 'ok';
}

function firewalled(key, buildShare) {
  return SERVER_ROOM.stations.includes(key) && inside(buildShare, FIREWALL.denied) && stationBuilt(key, buildShare) === 1;
}

function inside(value, [from, to]) {
  return value >= from && value < to;
}
