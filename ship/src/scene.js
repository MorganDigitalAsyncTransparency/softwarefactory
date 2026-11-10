import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { BACKGROUND } from './look.js';

const FOG = [0.02, 0.016, 0.013, 0.009, 0.007, 0.0008];
const EASE = 2;

// The renderer: a dark floor with a faint grid, soft light, fog that clears as the
// picture widens, and bloom so that everything lit glows.
export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND);
  scene.fog = new THREE.FogExp2(BACKGROUND, FOG[0]);
  scene.add(new THREE.HemisphereLight('#6f8cff', '#05060a', 1.2), sun(), floor());
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 3000);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.8, 0.3, 0.55));
  composer.addPass(new OutputPass());
  return { renderer, scene, camera, composer, look: new THREE.Vector3() };
}

// Eases the camera and the fog towards the shot and draws the frame.
export function renderFrame(view, shot, stage, dt) {
  const k = 1 - Math.exp(-EASE * dt);
  view.camera.position.lerp(new THREE.Vector3(...shot.position), k);
  view.look.lerp(new THREE.Vector3(...shot.target), k);
  view.camera.lookAt(view.look);
  view.scene.fog.density += (FOG[stage] - view.scene.fog.density) * k;
  fit(view);
  view.composer.render();
}

export function jump(view, shot, stage) {
  view.camera.position.set(...shot.position);
  view.look.set(...shot.target);
  view.scene.fog.density = FOG[stage];
}

function fit({ renderer, camera, composer }) {
  const { clientWidth: width, clientHeight: height } = renderer.domElement;
  const size = renderer.getSize(new THREE.Vector2());
  if (size.x === width && size.y === height) return;
  renderer.setSize(width, height, false);
  composer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function sun() {
  const light = new THREE.DirectionalLight('#c9d8ff', 0.9);
  light.position.set(-20, 40, 30);
  return light;
}

function floor() {
  const group = new THREE.Group();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshStandardMaterial({ color: '#070a12', roughness: 0.9 }));
  ground.rotation.x = -Math.PI / 2;
  const lines = new THREE.GridHelper(1600, 200, '#12305a', '#0b1a33');
  lines.position.y = 0.01;
  group.add(ground, lines);
  return group;
}
