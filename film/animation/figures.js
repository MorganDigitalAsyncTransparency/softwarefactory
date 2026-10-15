import { el, group } from './svg.js';

const BOX_SIZE = 24;
// The style block asks for diverse people; each figure picks one tone by its seed.
const SKIN_TONES = ['#F1D7BF', '#D9A77C', '#A86F48', '#6E4529'];

export function box(x, y, palette, { dented = false, scale = 1 } = {}) {
  const size = BOX_SIZE * scale;
  const shape = [
    el('rect', {
      x: x - size / 2, y: y - size / 2, width: size, height: size, rx: 3,
      fill: palette.box, stroke: palette.boxEdge, 'stroke-width': 2,
    }),
  ];
  if (dented) shape.push(dent(x + size / 2, y - size / 2, palette));
  return group(shape);
}

function dent(cornerX, cornerY, palette) {
  return el('path', {
    d: `M ${cornerX - 10} ${cornerY} L ${cornerX - 4} ${cornerY + 7} L ${cornerX} ${cornerY + 10}`,
    fill: 'none', stroke: palette.dent, 'stroke-width': 3,
  });
}

export function person(x, y, color, { seed = 0, hardHat = false, carrying = null } = {}) {
  const parts = [
    el('rect', { x: x - 10, y: y - 14, width: 20, height: 28, rx: 8, fill: color }),
    el('circle', { cx: x, cy: y - 24, r: 9, fill: SKIN_TONES[seed % SKIN_TONES.length] }),
  ];
  if (hardHat) parts.push(hat(x, y, color));
  if (carrying) parts.push(carrying);
  return group(parts);
}

function hat(x, y, color) {
  return el('path', { d: `M ${x - 11} ${y - 26} A 11 10 0 0 1 ${x + 11} ${y - 26} Z`, fill: color });
}

export function robot(x, y, palette, lightColor = palette.light) {
  return group([
    el('rect', {
      x: x - 13, y: y - 11, width: 26, height: 22, rx: 8,
      fill: palette.robot, stroke: palette.robotEdge, 'stroke-width': 2,
    }),
    el('circle', { cx: x, cy: y - 1, r: 4, fill: lightColor }),
  ]);
}

export function rack(x, y, palette) {
  return el('rect', { x: x - 9, y: y - 16, width: 18, height: 32, rx: 2, fill: palette.rack });
}
