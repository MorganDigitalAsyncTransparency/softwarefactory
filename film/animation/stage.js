import * as THREE from 'three';
import { world } from './world.js';
import { panels } from './panels.js';
import { setDigital, sky } from './materials.js';
import { slab } from './shapes.js';

const ASPECT = 16 / 9;
const PANEL_GAP = 0.012;

// The 3D stage: one renderer and one camera, drawing either the factory or the three
// close-up panels of S11.
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const camera = new THREE.PerspectiveCamera(32, ASPECT, 0.5, 600);
  return {
    render(shot, time) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      if (shot.panels === undefined) drawFactory({ renderer, camera }, shot, time);
      else drawPanels({ renderer, camera }, shot.panels, time);
    },
  };
}

function drawFactory({ renderer, camera }, { camera: [position, target], state }, time) {
  setDigital(state.digital);
  const scene = lit(world(state, time), 70);
  scene.background = sky(state.digital);
  scene.fog = new THREE.Fog(scene.background, 120, 320);
  aim(camera, position, target, ASPECT);
  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, ...size(renderer));
  renderer.render(scene, camera);
}

function drawPanels({ renderer, camera }, progress, time) {
  setDigital(0);
  const [width, height] = size(renderer);
  const panelWidth = width * (1 - 2 * PANEL_GAP) / 3;
  renderer.setScissorTest(true);
  renderer.setClearColor('#000000');
  renderer.clear();
  panels(progress, time).forEach(({ contents, look: [target, distance] }, index) => {
    const x = index * (panelWidth + width * PANEL_GAP);
    const scene = lit(contents.add(slab([-30, -30], [30, 30], [-0.1, 0], 'floor')), 12);
    scene.background = sky(0);
    aim(camera, [target[0] + (progress - 0.5) * 3, target[1] + distance * 0.35, distance], target, panelWidth / height);
    renderer.setViewport(x, 0, panelWidth, height);
    renderer.setScissor(x, 0, panelWidth, height);
    renderer.render(scene, camera);
  });
}

function size(renderer) {
  const vector = renderer.getSize(new THREE.Vector2());
  return [vector.x, vector.y];
}

function aim(camera, position, target, aspect) {
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  camera.position.set(...position);
  camera.lookAt(...target);
}

// Lights are made once per size, because each sun owns a shadow map on the graphics card.
const lights = new Map();

function lit(contents, reach) {
  if (!lights.has(reach)) lights.set(reach, daylight(reach));
  const scene = new THREE.Scene();
  scene.add(...lights.get(reach), contents);
  return scene;
}

// Soft light from the sky, and the sun casting shadows over a square of `reach` metres.
function daylight(reach) {
  const sun = new THREE.DirectionalLight('#FFF4E5', 2.4);
  sun.position.set(reach * 0.5, reach, reach * 0.7);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -reach, right: reach, top: reach, bottom: -reach, far: reach * 4 });
  sun.shadow.bias = -0.0005;
  return [new THREE.HemisphereLight('#FFFFFF', '#B5AC9E', 1.4), sun];
}
