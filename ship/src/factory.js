import * as THREE from 'three';
import { STRIPE, createLane, updateLane } from './lane.js';
import { SPEED } from './route.js';
import { createHall, updateHall } from './hall.js';
import { LANE_Z, appear } from './look.js';

// The factory in the middle of the picture: its lanes, which join as the stage asks for
// them, and the hall that is built around them.
export function createFactory(scene) {
  const stripes = beltStripes();
  const lanes = LANE_Z.map((z) => createLane(z, stripes));
  const hall = createHall();
  scene.add(...lanes.map((lane) => lane.group), hall.group);
  return { lanes, hall, maps: lanes.flatMap((lane) => lane.maps), flashes: LANE_Z.map(() => -1) };
}

export function flashGate(factory, lane, time) {
  factory.flashes[lane] = time;
}

export function updateFactory(factory, { stage, time, carriedBy }) {
  for (const map of factory.maps) map.offset.x = -time * SPEED / STRIPE;
  factory.lanes.forEach((lane, index) => {
    appear(lane.group, index < stage.lanes, time);
    updateLane(lane, { stage, time, carried: carriedBy(index), flash: factory.flashes[index] });
  });
  updateHall(factory.hall, Boolean(stage.hall), time);
}

// Chevrons painted on the belts, drawn in code, so that a moving belt is seen moving.
function beltStripes() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 16;
  const paint = canvas.getContext('2d');
  paint.fillStyle = '#1a2233';
  paint.fillRect(0, 0, 64, 16);
  paint.fillStyle = '#2d4a74';
  paint.fillRect(0, 0, 8, 16);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}
