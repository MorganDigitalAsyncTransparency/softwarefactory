import * as THREE from 'three';
import { block, group, slab, sphere, tube } from './shapes.js';
import { person, robot } from './figures.js';
import { CLOUD, noise } from './layout.js';

const PUFFS = Array.from({ length: 18 }, (_, index) => ({
  position: [-14 + index * 1.65, noise(index) * 1.6, (noise(index + 0.3) - 0.5) * 7],
  radius: 2.6 + noise(index + 0.6) * 2,
}));
const RACKS = [-10.5, -7.5, -4.5, -1.5, 1.5, 4.5, 7.5, 10.5];
const TOP = 2.2;
// The racks in the cloud stand tall, so they read as servers from far below.
const TALL = 4.5;
// The IT developers up there are drawn a little larger, for the same reason.
const SEEN_FROM_BELOW = 1.3;

// IT infrastructure: the cloud, with a platform for its server racks.
export function cloud() {
  const puffs = PUFFS.map(({ position, radius }) => sphere(radius, 'cloud', position));
  puffs.forEach((puff) => { puff.scale.y = 0.5; puff.castShadow = false; });
  return group([...puffs, slab([-12.5, -2.2], [12.5, 2.2], [TOP - 0.3, TOP], 'rack')], { position: [CLOUD.x, CLOUD.y, CLOUD.z] });
}

// The racks in the cloud, `count` of them standing; the next one is rising, so the
// cloud grows all through the film.
export function cloudRacks(count) {
  return group(risingRacks(RACKS.map((x) => [CLOUD.x + x, CLOUD.y + TOP, CLOUD.z]), count, TALL));
}

// Racks at `positions`, `count` of them standing and the next one rising.
export function risingRacks(positions, count, height) {
  return positions.slice(0, Math.ceil(count)).map((position, index) => {
    const standing = rack(position, height);
    standing.scale.y = Math.min(1, count - index);
    return standing;
  });
}

// The AI agents walking between the racks, relative to the cloud.
export function agents(time) {
  return group([-3, 3, 6].map((x, index) => walker(x, time, index)));
}

// IT developers in blue at work by the racks, each pacing to and fro in front of one,
// where the puffs in front are low enough to show them.
export function itDevelopers(time) {
  return group([-9.5, 4, 8.5].map((x, index) => {
    const walked = Math.sin(time * 0.35 + index * 1.7);
    const speed = Math.cos(time * 0.35 + index * 1.7);
    const developer = group([person('it', { seed: index, walked })], {
      position: [CLOUD.x + x + walked, CLOUD.y + TOP, CLOUD.z + 1.9], turn: speed > 0 ? 0 : Math.PI,
    });
    developer.scale.setScalar(SEEN_FROM_BELOW);
    return developer;
  }));
}

// A red light on the cloud, blinking while a service in it has failed. Relative to the cloud.
export function alarm(time) {
  const on = Math.sin(time * 9) > -0.3;
  return group([block([0.2, 1.6, 0.2], 'steel', [0, TOP + 0.8, 2.6]), sphere(0.8, on ? 'stop' : 'off', [0, TOP + 2.2, 2.6])], {
    position: [CLOUD.x, CLOUD.y, CLOUD.z],
  });
}

// A server rack standing at `position`, in the cloud or in the server room.
function rack(position, height) {
  const lights = [0.2, 0.4, 0.6, 0.8].map((share) => block([0.9, 0.08, 0.05], 'it', [0, height * share, 0.62]));
  return group([block([1.2, height, 1.2], 'rack', [0, height / 2, 0]), ...lights], { position });
}

function walker(x, time, index) {
  const reach = Math.sin(time * 0.6 + index * 2);
  const agent = group([robot({ time: time + index })], {
    position: [CLOUD.x + x + reach * 0.9, CLOUD.y + TOP, CLOUD.z + 1.6 - index * 0.3], turn: reach > 0 ? 0 : Math.PI,
  });
  agent.scale.setScalar(0.8);
  return agent;
}

// A cable to a station: an integration that has to work at every step. It hangs down
// from the cloud, or arches over from another point such as the server room.
// `connected` draws part of it, for a cable that is still being pulled.
export function cable(end, connected = 1, from = null) {
  const to = new THREE.Vector3(end.x, end.y, end.z);
  const start = from ? new THREE.Vector3(from.x, from.y, from.z) : new THREE.Vector3(CLOUD.x + end.x * 0.3, CLOUD.y - 1.5, CLOUD.z + 1 + end.z * 0.15);
  const [drop, rise] = from ? [4, 4] : [-9, 7];
  const curve = new THREE.CubicBezierCurve3(start, start.clone().setY(start.y + drop), to.clone().setY(to.y + rise), to);
  const wire = tube(JSON.stringify([end, from]), curve, 'it');
  wire.castShadow = false;
  connect(wire, connected);
  return wire;
}

export function connect(wire, share) {
  wire.geometry.setDrawRange(0, Math.floor((wire.geometry.index.count * share) / 3) * 3);
  return wire;
}
