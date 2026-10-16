import * as THREE from 'three';
import { material } from './materials.js';

// Geometries are shared by size, so a frame that is drawn again creates no new geometry.
const geometries = new Map();

function shared(key, make) {
  if (!geometries.has(key)) geometries.set(key, make());
  return geometries.get(key);
}

function mesh(geometry, look, position = [0, 0, 0]) {
  const result = new THREE.Mesh(geometry, typeof look === 'string' ? material(look) : look);
  result.position.set(...position);
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}

// Blocks share one unit cube, scaled, because walls and belts grow to any length.
export function block(size, look, position) {
  const result = mesh(shared('block', () => new THREE.BoxGeometry(1, 1, 1)), look, position);
  result.scale.set(...size);
  return result;
}

// A block standing on the floor between two corners, which is how walls and belts are laid out.
export function slab([x1, z1], [x2, z2], [bottom, top], look) {
  const size = [Math.abs(x2 - x1), top - bottom, Math.abs(z2 - z1)];
  return block(size, look, [(x1 + x2) / 2, (bottom + top) / 2, (z1 + z2) / 2]);
}

export function cylinder([radius, height], look, position) {
  const geometry = shared(`cylinder ${radius} ${height}`, () => new THREE.CylinderGeometry(radius, radius, height, 16));
  return mesh(geometry, look, position);
}

export function sphere(radius, look, position) {
  const geometry = shared(`sphere ${radius}`, () => new THREE.SphereGeometry(radius, 24, 16));
  return mesh(geometry, look, position);
}

export function capsule([radius, length], look, position) {
  const geometry = shared(`capsule ${radius} ${length}`, () => new THREE.CapsuleGeometry(radius, length, 6, 12));
  return mesh(geometry, look, position);
}

export function tube(key, curve, look) {
  const geometry = shared(`tube ${key}`, () => new THREE.TubeGeometry(curve, 48, 0.08, 8));
  return mesh(geometry, look);
}

export function group(children, { position = [0, 0, 0], turn = 0, scale = 1 } = {}) {
  const result = new THREE.Group();
  children.filter(Boolean).forEach((child) => result.add(child));
  result.position.set(...position);
  result.rotation.y = turn;
  result.scale.setScalar(scale);
  return result;
}
