import { block, group, slab } from './shapes.js';
import { rack } from './cloud.js';
import { SERVER_ROOM } from './layout.js';

const HEIGHT = 3.2;
const LOW = 1.1;
const RACKS = [25.6, 27.6, 29.6];

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
    ...RACKS.map((x) => rack([x, 0, port.z])),
    block([0.6, 0.4, 0.6], 'machine', [port.x, port.y - 0.2, port.z]),
  ]);
}
