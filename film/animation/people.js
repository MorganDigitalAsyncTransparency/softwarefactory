import { person } from './figures.js';
import { group } from './shapes.js';
import { wanderAt } from './wander.js';
import { AISLES, USERS } from './layout.js';

// People who work here and there, each in their own aisle: Product developers in the
// office and between the belts, Software factory developers and IT developers all over
// the hall, and an IT developer in the server room.
const WANDERERS = [
  ...[1, 2, 3].map((seed) => ({ role: 'product', area: AISLES.office, seed })),
  { role: 'product', area: AISLES.between0, seed: 4 },
  { role: 'product', area: AISLES.between2, seed: 5 },
  ...[6, 7].map((seed) => ({ role: 'factory', area: AISLES.front, seed })),
  ...[8, 9].map((seed) => ({ role: 'factory', area: AISLES.back, seed })),
  { role: 'factory', area: AISLES.between1, seed: 10 },
  { role: 'it', area: AISLES.front, seed: 11 },
  { role: 'it', area: AISLES.back, seed: 12 },
  { role: 'it', area: AISLES.between3, seed: 13 },
  { role: 'it', area: AISLES.serverRoom, seed: 14 },
];

export function people(time) {
  return group([
    ...WANDERERS.map((wanderer) => walking(wanderer, time)),
    ...USERS.map(([x, z], index) => group([person('user', { seed: index + 1 })], { position: [x, 0, z], turn: Math.PI })),
  ]);
}

function walking({ role, area, seed }, time) {
  const { x, z, turn, walked } = wanderAt({ area, seed }, time);
  return group([person(role, { seed, walked })], { position: [x, 0, z], turn });
}
