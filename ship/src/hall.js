import * as THREE from 'three';
import { block, glow, lit, metal } from './look.js';

const LENGTH = 64;
const WIDTH = 26;
const HEIGHT = 10;
const RIDGE = 13;
const BAY = 8;
const BUILD_SECONDS = 7;

// The hall that rises around the running belts: its frame is drawn line by line, with
// a spark where it is being built, while a crane turns beside it.
export function createHall() {
  const lines = frame();
  const group = new THREE.Group();
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), lit(glow.amber));
  const crane = createCrane();
  group.add(lines, spark, crane);
  return { group, lines, spark, crane, total: lines.geometry.attributes.position.count };
}

export function updateHall(hall, on, time) {
  hall.group.visible = on;
  if (!on) {
    hall.since = null;
    return;
  }
  hall.since ??= time;
  const built = Math.min(1, (time - hall.since) / BUILD_SECONDS);
  const count = 2 * Math.floor((hall.total / 2) * built);
  hall.lines.geometry.setDrawRange(0, count);
  hall.spark.visible = built < 1;
  if (count) hall.spark.position.fromBufferAttribute(hall.lines.geometry.attributes.position, count - 1);
  hall.crane.userData.jib.rotation.y = time * 0.25;
}

function frame() {
  const points = [];
  const line = (a, b) => points.push(...a, ...b);
  for (let x = -LENGTH / 2; x <= LENGTH / 2; x += BAY) {
    for (const z of [-WIDTH / 2, WIDTH / 2]) line([x, 0, z], [x, HEIGHT, z]);
  }
  for (const y of [HEIGHT / 2, HEIGHT]) {
    for (const z of [-WIDTH / 2, WIDTH / 2]) line([-LENGTH / 2, y, z], [LENGTH / 2, y, z]);
  }
  for (let x = -LENGTH / 2; x <= LENGTH / 2; x += BAY) {
    line([x, HEIGHT, -WIDTH / 2], [x, RIDGE, 0]);
    line([x, RIDGE, 0], [x, HEIGHT, WIDTH / 2]);
  }
  line([-LENGTH / 2, RIDGE, 0], [LENGTH / 2, RIDGE, 0]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.LineBasicMaterial({ color: glow.cyan, toneMapped: false, transparent: true, opacity: 0.8 });
  return new THREE.LineSegments(geometry, material);
}

function createCrane() {
  const crane = new THREE.Group();
  crane.position.set(-LENGTH / 2 - 8, 0, -WIDTH / 2 - 6);
  crane.add(block(metal, [1, 26, 1], [0, 13, 0]));
  const jib = new THREE.Group();
  jib.position.y = 26;
  jib.add(block(lit(glow.amber), [30, 0.5, 0.5], [9, 0, 0]));
  jib.add(block(lit(glow.dim), [0.05, 12, 0.05], [20, -6, 0]));
  crane.add(jib);
  crane.userData.jib = jib;
  return crane;
}
