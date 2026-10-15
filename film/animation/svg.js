const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export function el(tag, attributes = {}, children = []) {
  const node = document.createElementNS(SVG_NAMESPACE, tag);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
  node.append(...children);
  return node;
}

export function group(children, attributes = {}) {
  return el('g', attributes, children);
}

// The roles keep their colors in both palettes, so the viewer can follow them through
// the change from factory to software (visual-descriptions.md, style block).
const ROLES = {
  builder: '#E3B23C',
  infrastructure: '#3E7CB1',
  user: '#E07A3F',
  carrier: '#9A9A9A',
};

export const PHYSICAL = {
  ...ROLES,
  background: '#F4F1EC',
  floor: '#E6E0D6',
  wall: '#8C857B',
  belt: '#B3ACA1',
  roller: '#948C80',
  box: '#C9A27C',
  boxEdge: '#9C7A57',
  dent: '#7E6247',
  cloud: '#FFFFFF',
  cloudEdge: '#C9D6DD',
  rack: '#6F7C85',
  cable: '#5F6B73',
  robot: '#FAFAFA',
  robotEdge: '#9AA5AE',
  light: '#5AA9E6',
  ok: '#4CAF7A',
  stop: '#D9534F',
};

export const DIGITAL = {
  ...PHYSICAL,
  background: '#0E1A2B',
  floor: '#13263D',
  wall: '#2A4A6B',
  belt: '#1F6F8B',
  roller: '#2EC4B6',
  box: '#7FDBFF',
  boxEdge: '#BDEFFF',
  dent: '#2A8FB8',
  cloud: '#1B3554',
  cloudEdge: '#4CC9F0',
  rack: '#4CC9F0',
  cable: '#4CC9F0',
};
