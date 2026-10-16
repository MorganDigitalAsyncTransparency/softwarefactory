import { person } from './figures.js';
import { group } from './shapes.js';
import { wanderAt } from './wander.js';
import { AISLES, USERS } from './layout.js';

// People who work here and there, each in their own aisle: Product developers in the
// office and between the belts, Software factory developers and IT developers on the
// floor of the hall.
const WANDERERS = [
  ...[1, 2, 3].map((seed) => ({ role: 'product', area: AISLES.office, seed })),
  { role: 'product', area: AISLES.middle, seed: 4 },
  ...[5, 6, 7].map((seed) => ({ role: 'factory', area: AISLES.front, seed })),
  ...[8, 9].map((seed) => ({ role: 'factory', area: AISLES.back, seed })),
  ...[10, 11].map((seed) => ({ role: 'it', area: AISLES.front, seed })),
  { role: 'it', area: AISLES.back, seed: 12 },
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
