import * as THREE from 'three';
import { ROUTE } from './route.js';
import { BELT_TOP, appear, block, glow, lit, metal, veil } from './look.js';

export const STRIPE = 4;
const GATE_HEIGHT = 2.6;
const ROBOT_BASE = new THREE.Vector3(-4.5, 0, -1.8);
const REST = new THREE.Vector3(ROUTE.gapFrom, 1, 0);

// One lane of the factory: two belts with a gap where changes are handed over, a gate
// and the dock where they ship. The carrier, the gate and the robot come and go with
// the stage.
export function createLane(z, stripes) {
  const group = new THREE.Group();
  group.position.z = z;
  const lane = { group, gate: gate(), robot: robot(), carrier: carrier(), maps: [] };
  group.add(belt(ROUTE.start, ROUTE.gapFrom, stripes, lane.maps), belt(ROUTE.gapTo, ROUTE.end, stripes, lane.maps), dock());
  group.add(lane.gate, lane.robot, lane.carrier);
  return lane;
}

export function updateLane(lane, { stage, time, carried, flash }) {
  appear(lane.gate, stage.gates, time);
  appear(lane.robot, stage.robots, time);
  lane.carrier.visible = !stage.robots;
  const curtain = lane.gate.userData.curtain;
  curtain.material.color.copy(time - flash < 0.35 ? glow.red : glow.cyan);
  curtain.material.opacity = 0.1 + 0.06 * Math.sin(time * 6);
  const holding = carried ? new THREE.Vector3(carried.x, BELT_TOP + carried.y, 0) : REST;
  aimArm(lane, holding);
  lane.carrier.position.set(carried ? carried.x : (ROUTE.gapFrom + ROUTE.gapTo) / 2, 0.75, 0);
}

function aimArm(lane, holding) {
  const pivot = lane.robot.userData.pivot;
  pivot.lookAt(lane.group.localToWorld(holding.clone()));
}

// Each belt gets its own copy of the stripes, one stripe every few metres, so that
// every belt moves its stripes at the speed of its boxes.
function belt(from, to, stripes, maps) {
  const length = to - from;
  const map = stripes.clone();
  map.repeat.set(length / STRIPE, 1);
  maps.push(map);
  const top = new THREE.MeshStandardMaterial({ color: '#ffffff', map, roughness: 0.7 });
  const group = new THREE.Group();
  group.add(block([metal, metal, top, metal, metal, metal], [length, BELT_TOP, 1.6], [0, BELT_TOP / 2, 0]));
  for (const side of [-0.82, 0.82]) group.add(block(lit(glow.dim), [length, 0.06, 0.06], [0, BELT_TOP, side]));
  group.position.x = (from + to) / 2;
  return group;
}

function dock() {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 8, 40), lit(glow.amber));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(ROUTE.end + 0.6, BELT_TOP + 0.05, 0);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 40, 24, 1, true), veil(glow.amber, 0.025));
  beam.position.set(ROUTE.end + 0.6, 20, 0);
  const group = new THREE.Group();
  group.add(ring, beam);
  return group;
}

function gate() {
  const frame = lit(glow.cyan);
  const group = new THREE.Group();
  group.position.x = ROUTE.gate;
  for (const side of [-1.15, 1.15]) group.add(block(frame, [0.14, GATE_HEIGHT, 0.14], [0, GATE_HEIGHT / 2, side]));
  group.add(block(frame, [0.14, 0.14, 2.44], [0, GATE_HEIGHT, 0]));
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(2.3, GATE_HEIGHT), veil(glow.cyan, 0.12));
  curtain.rotation.y = Math.PI / 2;
  curtain.position.y = GATE_HEIGHT / 2;
  group.add(curtain);
  group.userData.curtain = curtain;
  return group;
}

function robot() {
  const group = new THREE.Group();
  group.position.copy(ROBOT_BASE);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 2.2, 16), metal);
  base.position.y = 1.1;
  const pivot = new THREE.Group();
  pivot.position.y = 2.2;
  pivot.add(block(lit(glow.cyan), [0.3, 0.3, 3], [0, 0, 1.5]));
  group.add(base, pivot);
  group.userData.pivot = pivot;
  return group;
}

function carrier() {
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.7, 4, 12), lit(glow.violet));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), lit(glow.violet));
  head.position.y = 0.75;
  body.add(head);
  return body;
}
