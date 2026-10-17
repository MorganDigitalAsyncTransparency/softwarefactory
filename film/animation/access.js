import { share } from './timeline.js';
import { LANES, SERVER_ROOM } from './layout.js';
import { stationReady, stationsBuiltDuringFilm } from './schedule.js';

// Communication in the factory is access controlled: the cable to a test station ends in
// a lock. Every value is a share of the film played, as in schedule.js.

// Now and then an access is changed elsewhere, and one station is denied and stops
// testing until an IT developer puts it right. Small and local, unlike the cloud outage.
const CHANGES = {
  'middle 0 0': [0.127, 0.16],
  'output 0 1': [0.387, 0.453],
  'intake 2 0': [0.907, 0.947],
};
// The IT developer comes over for the last part of a stop.
const IT_ARRIVES = 0.55;
// New stations that wait this long for their access after they are built.
const WAITING = { 'middle 1 2': 0.06, 'middle 3 2': 0.09 };
// Who tries the card reader by the server room, when: IT developers are let in, others are not.
const VISITS = [
  { role: 'it', at: [0.168, 0.18], light: 'ok' },
  { role: 'product', at: [0.186, 0.208], light: 'stop' },
];

// The stations a cable runs to: the first on every belt, those of the server room
// (SERVER_ROOM.stations) and those built during the film.
export function cabledStations() {
  const first = LANES.flatMap((_, laneIndex) => [`intake ${laneIndex} 0`, `middle ${laneIndex} 0`]);
  return new Set([...first, ...SERVER_ROOM.stations, ...stationsBuiltDuringFilm()]);
}

// 'granted', 'denied' while an access is wrong, or 'waiting' for a new station's first access.
export function accessAt(key, buildShare) {
  if (key in CHANGES && inside(buildShare, CHANGES[key])) return 'denied';
  if (key in WAITING && inside(buildShare, [stationReady(key), stationReady(key) + WAITING[key]])) return 'waiting';
  return 'granted';
}

// While a station is denied, a Product developer waits at it, and later an IT developer
// comes to fix it.
export function deniedCrew(key, buildShare) {
  if (accessAt(key, buildShare) !== 'denied') return [];
  return share(buildShare, ...CHANGES[key]) < IT_ARRIVES ? ['product'] : ['product', 'it'];
}

// Who stands at the card reader, and what it shows, once they have tried their card.
export function readerVisit(buildShare) {
  const visit = VISITS.find(({ at }) => inside(buildShare, at));
  if (!visit) return null;
  return { role: visit.role, light: share(buildShare, ...visit.at) > 0.5 && visit.light };
}

function inside(value, [from, to]) {
  return value >= from && value < to;
}
