import { block, capsule, cylinder, group, sphere } from './shapes.js';
import { rushAt } from './troubleshoot.js';

const BOX = 0.6;
const SKIN_TONES = ['skin0', 'skin1', 'skin2', 'skin3'];
const STRIDE = 1.4;
const TURNS = { 1: 0, 0: -Math.PI / 2, '-1': Math.PI };
const LEAN = 0.45;
const HIP = 0.76;

// How far to turn a figure that faces +x (1), the camera (0) or -x (-1).
export function facingTurn(facing) {
  return TURNS[facing];
}

// The product. A dented box is darker and squashed; a box of the wrong size is larger; a
// new box has a band in the color of something new the product needs. A sealed box has a
// strap round it, so whoever receives it can see it was not opened on the way.
export function box(look = 'good', { scale = 1, sealed = false } = {}) {
  const size = scale * (look === 'wrong' ? 1.45 : 1);
  const surface = look === 'dented' ? 'dented' : 'box';
  const shape = group([
    block([BOX, BOX, BOX], surface, [0, BOX / 2, 0]),
    block([BOX + 0.01, 0.02, 0.14], 'tape', [0, BOX + 0.005, 0]),
    look === 'new' && block([BOX + 0.02, 0.16, BOX + 0.02], 'feature', [0, BOX / 2, 0]),
    sealed && block([0.08, BOX + 0.03, BOX + 0.03], 'steel', [0, BOX / 2, 0]),
  ], { scale: size });
  if (look === 'dented') {
    shape.scale.y *= 0.72;
    shape.rotation.set(0.12, 0.35, -0.18);
  }
  return shape;
}

// A person in the color of their role: 'product', 'factory' (with a hard hat), 'it' or
// 'user'. Someone inspecting a machine leans over it with a magnifying glass.
export function person(role, { seed = 0, carrying = false, walked = 0, inspecting = false } = {}) {
  const swing = Math.sin((walked / STRIDE) * Math.PI * 2) * 0.45;
  const upper = group([
    capsule([0.24, 0.45], role, [0, 1.12, 0]),
    sphere(0.18, SKIN_TONES[seed % SKIN_TONES.length], [0, 1.62, 0]),
    role === 'factory' && hardHat(),
    carrying && group([box()], { position: [0.42, 0.95, 0] }),
    inspecting && magnifier(),
  ], { position: [0, -HIP, 0] });
  // The upper body bends at the hip.
  const body = group([upper], { position: [0, HIP, 0] });
  body.rotation.z = inspecting ? -LEAN : 0;
  return group([leg(-0.13, swing), leg(0.13, -swing), body]);
}

// A Software factory developer at work. While the cloud is down they run about near
// their work, within `area`, by default to and fro along their side of the machine, to
// find the fault (troubleshoot.js).
export function developer({ x, y = 0, z, turn = 0, seed }, outage, area = { x: [-Infinity, Infinity], z: [z, z] }) {
  const at = rushAt({ x, z, turn, walked: 0 }, { area, seed }, outage);
  return group([person('factory', { seed, walked: at.walked, inspecting: at.inspecting })], { position: [at.x, y, at.z], turn: at.turn });
}

function magnifier() {
  const lens = cylinder([0.13, 0.03], 'glass', [0, 0, 0]);
  lens.rotation.z = Math.PI / 2;
  return group([lens, block([0.04, 0.22, 0.04], 'steel', [0, -0.22, 0])], { position: [0.45, 1.2, 0] });
}

function leg(z, swing) {
  const result = group([capsule([0.1, 0.55], 'trousers', [0, -0.38, 0])], { position: [0, HIP, z] });
  result.rotation.z = swing;
  return result;
}

function hardHat() {
  return group([
    sphere(0.2, 'factory', [0, 0, 0]),
    cylinder([0.26, 0.03], 'factory', [0, -0.02, 0]),
  ], { position: [0, 1.7, 0] });
}

// A speech bubble with no words, high over and in front of someone talking so a gate or
// cable does not hide it: it holds a small picture of what they talk about.
export function bubble(subject) {
  const tail = [[0.12, -0.5, 0.08], [0.2, -0.8, 0.06], [0.26, -1.05, 0.045]].map(([x, y, radius]) => sphere(radius, 'bubble', [x, y, 0]));
  const shape = sphere(0.45, 'bubble', [0, 0, 0]);
  shape.scale.set(1, 0.75, 0.6);
  return group([shape, ...tail, group([subject], { position: [0, -0.12, 0.3], scale: 0.45 })], { position: [0, 3.3, 1.3] });
}

export function robot({ carrying = false, time = 0 } = {}) {
  const bob = Math.abs(Math.sin(time * 6)) * 0.04;
  return group([
    capsule([0.32, 0.5], 'robot', [0, 0.75 + bob, 0]),
    sphere(0.26, 'robot', [0, 1.45 + bob, 0]),
    sphere(0.09, 'it', [0.22, 1.48 + bob, 0]),
    carrying && group([box()], { position: [0.45, 0.85 + bob, 0] }),
  ]);
}
