import { block, group, slab, sphere } from './shapes.js';
import { light } from './materials.js';
import { risingRacks } from './cloud.js';
import { person } from './figures.js';
import { SERVER_ROOM } from './layout.js';

const HEIGHT = 3.2;
const LOW = 1.1;
const RACK_HEIGHT = 2.5;

// A small server room in the front corner of the hall: local IT that talks to some of
// the stations and to the cloud. Its front wall is low and it has no roof, so the racks
// stay in sight from the cameras in front and above.
export function serverRoom() {
  const { start, end, back, front, port } = SERVER_ROOM;
  return group([
    slab([start, back], [end, front], [0, 0.06], 'rack'),
    slab([start, back], [end, back + 0.2], [0, HEIGHT], 'wall'),
    slab([start, back], [start + 0.1, front], [0, HEIGHT], 'glass'),
    slab([start, front - 0.1], [end, front], [0, LOW], 'glass'),
    block([0.6, 0.4, 0.6], 'machine', [port.x, port.y - 0.2, port.z]),
  ]);
}

// The racks in the room, `count` of them standing: the next one is rising, with an IT
// developer installing it.
export function roomRacks(count) {
  const { racks, port: { z } } = SERVER_ROOM;
  const installing = racks[Math.floor(count)];
  return group([
    ...risingRacks(racks.map((x) => [x, 0, z]), count, RACK_HEIGHT),
    group([person('it', { seed: 1 })], { position: [installing, 0, z + 1.1], turn: -Math.PI / 2 }),
  ]);
}

// A card reader on the outside of the room's side wall, and whoever tries their card
// (`readerVisit` in access.js): its light shows whether they are let in.
export function cardReader(visit) {
  const { start, front } = SERVER_ROOM;
  const z = front - 1.4;
  return group([
    block([0.08, 0.36, 0.26], 'it', [start - 0.1, 1.3, z]),
    sphere(0.06, light(visit?.light), [start - 0.16, 1.42, z]),
    visit && group([person(visit.role, { seed: 3 })], { position: [start - 0.6, 0, z], turn: 0 }),
  ]);
}
