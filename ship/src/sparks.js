import * as THREE from 'three';
import { glow } from './look.js';

const COUNT = 600;
const GRAVITY = -14;
const LIFE = 1.4;

// Short bursts of light where a change ships or a gate stops one.
export function createSparks(scene) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(COUNT * 3).fill(-999), 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(COUNT * 3), 3));
  const material = new THREE.PointsMaterial({
    size: 0.35, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  return { geometry, particles: [], next: 0 };
}

export function burst(sparks, [x, y, z], color, amount = 16) {
  for (let i = 0; i < amount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    const velocity = [Math.cos(angle) * speed, 5 + Math.random() * 8, Math.sin(angle) * speed];
    sparks.particles[sparks.next] = { position: [x, y, z], velocity, age: 0 };
    sparks.geometry.attributes.color.setXYZ(sparks.next, color.r, color.g, color.b);
    sparks.next = (sparks.next + 1) % COUNT;
  }
  sparks.geometry.attributes.color.needsUpdate = true;
}

export function updateSparks(sparks, dt) {
  const positions = sparks.geometry.attributes.position;
  sparks.particles.forEach((particle, index) => {
    particle.age += dt;
    particle.velocity[1] += GRAVITY * dt;
    particle.position.forEach((value, axis) => (particle.position[axis] = value + particle.velocity[axis] * dt));
    const [x, y, z] = particle.age < LIFE ? particle.position : [0, -999, 0];
    positions.setXYZ(index, x, y, z);
  });
  positions.needsUpdate = true;
}
