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

// A firewall of red bricks on the room's link to the cloud (`firewallAt` in access.js),
// with who is at it.
export function firewall({ risen, crew }) {
  const { port } = SERVER_ROOM;
  const bricks = [[-0.4, 0], [0.4, 0], [0, 0.32], [-0.8, 0.32], [0.8, 0.32]]
    .map(([z, y]) => block([0.25, 0.28, 0.74], 'security', [0, y + 0.14, z]));
  const wall = group(bricks, { position: [port.x + 0.6, port.y, port.z] });
  wall.scale.y = risen;
  return group([
    risen > 0 && wall,
    ...crew.map((role, index) => group([person(role, { seed: index + 2 })], { position: [port.x - 0.8, 0, port.z + 0.9 + index], turn: 0 })),
  ]);
}

// A card reader with a keypad on the outside of the room's side wall, and whoever tries
// their card (`readerVisit` in access.js): its light shows whether they are let in.
export function cardReader(visit) {
  const { start, front } = SERVER_ROOM;
  const z = front - 1.4;
  return group([
    block([0.08, 0.36, 0.26], 'it', [start - 0.1, 1.3, z]),
    block([0.06, 0.2, 0.2], 'security', [start - 0.1, 1, z]),
    sphere(0.06, light(visit?.light), [start - 0.16, 1.42, z]),
    visit && group([person(visit.role, { seed: 3 })], { position: [start - 0.6, 0, z], turn: 0 }),
  ]);
}
