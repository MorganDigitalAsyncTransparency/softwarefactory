import * as THREE from 'three';
import { block, cylinder, group, slab, sphere } from './shapes.js';
import { light } from './materials.js';
import { belt } from './machines.js';
import { box } from './figures.js';
import { between } from './flow.js';
import { share } from './timeline.js';
import { PANEL_WARNING_AT } from './layout.js';

// Three close-ups side by side, where factory, IT and product do not fit together.
// Each returns its contents for one frame and where its camera looks.
export function panels(progress, time) {
  const warning = progress > PANEL_WARNING_AT;
  return [
    { contents: belts(progress), look: [[-0.5, 1.2, 0], 14] },
    { contents: shortCable(time), look: [[0, 4, 0], 16] },
    { contents: parts(progress), look: [[0, 1.2, 0], 13] },
  ].map(({ contents, look }) => ({ contents: group([contents, lamp(warning, time)]), look }));
}

function belts(progress) {
  const travel = share(progress, 0, 0.45);
  const stuck = share(progress, 0.45, 0.6);
  const part = group([box()], { position: [between(-3.5, -0.75, travel), 1, 0] });
  part.rotation.z = -0.5 * stuck;
  return group([belt(-5, -0.2, 0), group([belt(0, 5, 0)], { position: [0, 0.55, 0] }), part]);
}

function shortCable(time) {
  const sway = Math.sin(time * 1.4) * 0.25;
  const wire = cylinder([0.07, 4.2], 'it', [0, 5.4, 0]);
  return group([
    ...[-1.6, 0, 1.6, -0.8, 0.8].map((x, index) => sphere(1.1 + (index % 2) * 0.3, 'cloud', [x, 7.6 + (index % 2) * 0.5, -0.4])),
    group([wire, cylinder([0.28, 0.5], 'steel', [0, 3.1, 0])], { position: [sway, 0, 0] }),
    slab([-1.3, -0.9], [1.3, 0.9], [0, 1.6], 'machine'),
    block([0.6, 0.06, 0.6], 'hatch', [0, 1.62, 0]),
  ]);
}

function parts(progress) {
  const left = slab([-2.2, -0.8], [-0.4, 0.8], [0, 1.6], 'box');
  const right = slab([0, -0.6], [1.3, 0.6], [0, 2.3], 'box');
  return group([left, group([right], { position: [between(3, 0.35, share(progress, 0, 0.6)), 0, 0] })]);
}

function lamp(on, time) {
  const glow = new THREE.PointLight('#FF4234', on ? 30 + Math.sin(time * 8) * 10 : 0, 8);
  glow.position.set(0, 4.6, -1);
  return group([cylinder([0.06, 4], 'steel', [0, 2, -2.2]), sphere(0.3, light(on && 'stop'), [0, 4.2, -2.2]), glow]);
}
