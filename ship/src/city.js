import * as THREE from 'three';
import { glow, lit } from './look.js';

const SIDE = 13;
const SPACING = [96, 52];
const LANES = [-7.2, 0, 7.2];
const WAVE_SPEED = 160;
const BELT = 48;

// The finale: the factory is one of many. Halls light up in a wave from the middle,
// and changes run along each of their belts.
export function createCity(scene) {
  const sites = grid();
  const halls = new THREE.InstancedMesh(new THREE.BoxGeometry(64, 1, 26), lit(new THREE.Color(0.025, 0.06, 0.14)), sites.length);
  const belts = new THREE.InstancedMesh(new THREE.BoxGeometry(BELT, 0.3, 0.5), lit(glow.cyan), sites.length * LANES.length);
  const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), lit(glow.amber), sites.length * LANES.length);
  const group = new THREE.Group();
  group.add(halls, belts, boxes);
  for (const mesh of [halls, belts, boxes]) mesh.frustumCulled = false;
  scene.add(group);
  return { group, sites, halls, belts, boxes, matrix: new THREE.Matrix4() };
}

export function updateCity(city, on, time) {
  city.group.visible = on;
  if (!on) return void (city.since = null);
  city.since ??= time;
  const reach = (time - city.since) * WAVE_SPEED;
  city.sites.forEach((site, index) => placeSite(city, site, index, { reach, time }));
  for (const mesh of [city.halls, city.belts, city.boxes]) mesh.instanceMatrix.needsUpdate = true;
}

function placeSite(city, site, index, { reach, time }) {
  const grown = THREE.MathUtils.clamp((reach - site.distance) / 40, 0.001, 1);
  put(city.halls, index, [site.x, 0.5 * grown, site.z], grown, city.matrix);
  LANES.forEach((z, lane) => {
    const slot = index * LANES.length + lane;
    const run = ((time * 9 + site.phase + lane * 13) % BELT) - BELT / 2;
    put(city.belts, slot, [site.x, 1.2, site.z + z], grown, city.matrix);
    put(city.boxes, slot, [site.x + run, 2.1, site.z + z], grown, city.matrix);
  });
}

function put(mesh, index, [x, y, z], scale, matrix) {
  matrix.makeScale(scale, scale, scale).setPosition(x, y, z);
  mesh.setMatrixAt(index, matrix);
}

function grid() {
  const sites = [];
  const half = (SIDE - 1) / 2;
  for (let i = -half; i <= half; i += 1) {
    for (let j = -half; j <= half; j += 1) {
      const [x, z] = [i * SPACING[0], j * SPACING[1]];
      if (i || j) sites.push({ x, z, distance: Math.hypot(x, z), phase: (i * 7 + j * 11) * 5 });
    }
  }
  return sites;
}
