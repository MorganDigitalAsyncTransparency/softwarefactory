import * as THREE from 'three';
import { block, group, slab, sphere, tube } from './shapes.js';
import { robot } from './figures.js';
import { CLOUD, noise } from './layout.js';

const PUFFS = Array.from({ length: 18 }, (_, index) => ({
  position: [-14 + index * 1.65, noise(index) * 1.6, (noise(index + 0.3) - 0.5) * 7],
  radius: 2.6 + noise(index + 0.6) * 2,
}));
const RACKS = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5];
const TOP = 2.2;

// IT infrastructure: the cloud, with server racks on it.
export function cloud() {
  const puffs = PUFFS.map(({ position, radius }) => sphere(radius, 'cloud', position));
  puffs.forEach((puff) => { puff.scale.y = 0.5; puff.castShadow = false; });
  return group([
    ...puffs,
    slab([-9.5, -2.2], [9.5, 2.2], [TOP - 0.3, TOP], 'rack'),
    ...RACKS.map((x) => rack(x)),
  ], { position: [CLOUD.x, CLOUD.y, CLOUD.z] });
}

// The AI agents walking between the racks, relative to the cloud.
export function agents(time) {
  return group([-3, 3, 6].map((x, index) => walker(x, time, index)));
}

// A red light on the cloud, blinking while a service in it has failed. Relative to the cloud.
export function alarm(time) {
  const on = Math.sin(time * 9) > -0.3;
  return group([block([0.2, 1.6, 0.2], 'steel', [0, TOP + 0.8, 2.6]), sphere(0.8, on ? 'stop' : 'off', [0, TOP + 2.2, 2.6])], {
    position: [CLOUD.x, CLOUD.y, CLOUD.z],
  });
}

function rack(x) {
  const lights = [0.5, 1, 1.5, 2].map((y) => block([0.9, 0.08, 0.05], 'it', [x, TOP + y, 0.62]));
  return group([block([1.2, 2.5, 1.2], 'rack', [x, TOP + 1.25, 0]), ...lights]);
}

function walker(x, time, index) {
  const reach = Math.sin(time * 0.6 + index * 2);
  const agent = group([robot({ time: time + index })], {
    position: [CLOUD.x + x + reach * 0.9, CLOUD.y + TOP, CLOUD.z + 1.6 - index * 0.3], turn: reach > 0 ? 0 : Math.PI,
  });
  agent.scale.setScalar(0.8);
  return agent;
}

// A cable from the cloud down to a station: an integration that has to work at every
// step. `connected` draws part of it, for a cable that is still being pulled.
export function cable({ x, y, z }, connected = 1) {
  const start = new THREE.Vector3(CLOUD.x + x * 0.3, CLOUD.y - 1.5, CLOUD.z + 1 + z * 0.15);
  const end = new THREE.Vector3(x, y, z);
  const curve = new THREE.CubicBezierCurve3(start, start.clone().setY(start.y - 9), end.clone().setY(end.y + 7), end);
  const wire = tube(`${x} ${y} ${z}`, curve, 'it');
  wire.castShadow = false;
  connect(wire, connected);
  return wire;
}

export function connect(wire, share) {
  wire.geometry.setDrawRange(0, Math.floor((wire.geometry.index.count * share) / 3) * 3);
  return wire;
}
