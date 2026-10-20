import { person } from './figures.js';
import { group } from './shapes.js';
import { wanderAt } from './wander.js';
import { rushAt } from './troubleshoot.js';
import { AISLES, USERS } from './layout.js';

// People who work here and there, each in their own aisle: Product developers in the
// office and between the belts, Software factory developers and IT developers all over
// the hall, IT security developers in front and at the back, and an IT developer in the
// server room. While the cloud is down, the Software factory developers run about their
// aisle to find the fault.
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
  { role: 'security', area: AISLES.front, seed: 15 },
  { role: 'security', area: AISLES.back, seed: 16 },
];

export function people(time, outage) {
  return group([
    ...WANDERERS.map((wanderer) => walking(wanderer, time, outage)),
    ...USERS.map(([x, z], index) => group([person('user', { seed: index + 1 })], { position: [x, 0, z], turn: Math.PI })),
  ]);
}

function walking({ role, area, seed }, time, outage) {
  const home = wanderAt({ area, seed }, time);
  const { x, z, turn, walked, inspecting } = role === 'factory' ? rushAt(home, { area, seed }, outage) : home;
  return group([person(role, { seed, walked, inspecting })], { position: [x, 0, z], turn });
}
