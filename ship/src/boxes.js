import * as THREE from 'three';
import { advance, newBox } from './route.js';
import { BELT_TOP, LANE_Z, glow } from './look.js';
import { trace } from './trace.js';

const MAX = 500;
const SIZE = 0.9;
const AXIS = new THREE.Vector3(1, 0, 0);
const SCALE = new THREE.Vector3();

// The changes on their way: each is a glowing box that the route moves. A broken box
// looks like the others until a gate sees inside it, or until it reaches the users.
export function createBoxes(scene) {
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(SIZE, SIZE, SIZE), new THREE.MeshBasicMaterial({ toneMapped: false }), MAX);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { mesh, list: [], matrix: new THREE.Matrix4(), turn: new THREE.Quaternion() };
}

export function spawnBox(boxes, lane, broken) {
  trace('spawnBox');
  if (boxes.list.length < MAX) boxes.list.push(newBox(lane, broken));
}

export function clearBoxes(boxes) {
  boxes.list.length = 0;
}

// Moves every box and returns what happened on the way, for the sound and the count.
export function moveBoxes(boxes, dt, rules) {
  const events = [];
  for (const box of boxes.list) {
    const event = advance(box, dt, rules);
    if (event) events.push({ event, box });
  }
  boxes.list = boxes.list.filter((box) => box.phase !== 'done');
  return events;
}

// The box each lane is carrying over its gap right now, if any.
export function carriedBy(boxes, lane) {
  return boxes.list.find((box) => box.lane === lane && box.phase === 'carry');
}

export function drawBoxes(boxes) {
  const { mesh, list, matrix, turn } = boxes;
  list.forEach((box, index) => {
    const tumble = box.phase === 'pushed' ? box.t * 6 : 0;
    turn.setFromAxisAngle(AXIS, tumble);
    const shrink = box.phase === 'rising' ? Math.max(0.05, 1 - box.t) : 1;
    const position = new THREE.Vector3(box.x, BELT_TOP + SIZE / 2 + box.y, LANE_Z[box.lane] + box.side);
    matrix.compose(position, turn, SCALE.setScalar(shrink));
    mesh.setMatrixAt(index, matrix);
    mesh.setColorAt(index, showsBroken(box) ? glow.red : glow.amber);
  });
  mesh.count = list.length;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function showsBroken(box) {
  return box.seen || (box.broken && box.phase === 'rising');
}
