import { block, capsule, cylinder, group, sphere } from './shapes.js';
import { material } from './materials.js';

const BOX = 0.6;
const SKIN_TONES = ['skin0', 'skin1', 'skin2', 'skin3'];
const STRIDE = 1.4;
const TURNS = { 1: 0, 0: -Math.PI / 2, '-1': Math.PI };

// How far to turn a figure that faces +x (1), the camera (0) or -x (-1).
export function facingTurn(facing) {
  return TURNS[facing];
}

// The product. A dented box is darker and squashed; a box of the wrong size is larger.
export function box(look = 'good', { scale = 1 } = {}) {
  const size = scale * (look === 'wrong' ? 1.45 : 1);
  const surface = look === 'dented' ? 'dented' : 'box';
  const shape = group([
    block([BOX, BOX, BOX], surface, [0, BOX / 2, 0]),
    block([BOX + 0.01, 0.02, 0.14], 'tape', [0, BOX + 0.005, 0]),
  ], { scale: size });
  if (look === 'dented') {
    shape.scale.y *= 0.72;
    shape.rotation.set(0.12, 0.35, -0.18);
  }
  return shape;
}

// A person in the color of their role. A Carrier who is promoted turns into a Builder:
// the vest turns yellow and a hard hat appears.
export function person(role, { seed = 0, carrying = false, walked = 0, promoted = 0 } = {}) {
  const swing = Math.sin((walked / STRIDE) * Math.PI * 2) * 0.45;
  const builder = role === 'builder' || promoted > 0;
  const torso = role === 'carrier' && promoted > 0 ? vest(promoted) : role;
  return group([
    leg(-0.13, swing, role),
    leg(0.13, -swing, role),
    capsule([0.24, 0.45], torso, [0, 1.12, 0]),
    sphere(0.18, SKIN_TONES[seed % SKIN_TONES.length], [0, 1.62, 0]),
    builder && hardHat(role === 'builder' ? 1 : promoted),
    carrying && group([box()], { position: [0.42, 0.95, 0] }),
  ]);
}

let promotion;

function vest(promoted) {
  promotion ??= material('carrier').clone();
  promotion.color.copy(material('carrier').color).lerp(material('builder').color, promoted);
  return promotion;
}

function leg(z, swing, role) {
  const trousers = role === 'infrastructure' ? 'infrastructure' : 'trousers';
  const result = group([capsule([0.1, 0.55], trousers, [0, -0.38, 0])], { position: [0, 0.76, z] });
  result.rotation.z = swing;
  return result;
}

function hardHat(size) {
  return group([
    sphere(0.2, 'builder', [0, 0, 0]),
    cylinder([0.26, 0.03], 'builder', [0, -0.02, 0]),
  ], { position: [0, 1.7, 0], scale: size });
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
