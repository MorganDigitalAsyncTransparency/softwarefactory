import * as THREE from 'three';

// The look shared by every part: dark machines, light that glows, and how a part grows
// into place when the factory builds it.
export const BACKGROUND = '#04060c';
export const LANE_Z = [0, -3.6, 3.6, -7.2, 7.2];
export const BELT_TOP = 0.4;

export const glow = {
  cyan: new THREE.Color(0.2, 1, 1.8),
  dim: new THREE.Color(0.05, 0.3, 0.6),
  amber: new THREE.Color(2, 0.85, 0.2),
  red: new THREE.Color(3, 0.25, 0.2),
  violet: new THREE.Color(0.8, 0.4, 1.6),
};

export const metal = new THREE.MeshStandardMaterial({ color: '#141a28', roughness: 0.5, metalness: 0.6 });

export function lit(color) {
  return new THREE.MeshBasicMaterial({ color, toneMapped: false });
}

export function veil(color, opacity) {
  return new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
}

export function block(material, [w, h, d], [x, y, z]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

// Shows a part while `on` holds, growing it in with a small overshoot, and remembers
// when it came so it grows only once.
export function appear(part, on, time) {
  if (!on) {
    part.visible = false;
    part.userData.since = null;
    return;
  }
  part.userData.since ??= time;
  const k = Math.min(1, (time - part.userData.since) / 0.8);
  part.visible = true;
  part.scale.setScalar(Math.max(0.001, 1 + 2.7 * (k - 1) ** 3 + 1.7 * (k - 1) ** 2));
}
