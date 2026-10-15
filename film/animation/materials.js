import * as THREE from 'three';

// Each surface has a physical look and a digital look (S17). The colors follow the style
// block in film/script/visual-descriptions.md, which keeps the four layers apart.
const LOOKS = {
  ground: { physical: '#B9C2B0', digital: '#06121F' },
  floor: { physical: '#C3C5C6', digital: '#0B1C2E' },
  floorLine: { physical: '#E2B93B', digital: '#1B5F80' },
  wall: { physical: '#E6D3B3', digital: '#0B1C2E', fade: true },
  glass: { physical: '#A9BBC4', digital: '#0B1C2E', fade: true },
  steel: { physical: '#50565E', digital: '#16304A', fade: true, metal: true },
  scaffold: { physical: '#9AA1A8', digital: '#0B1C2E', fade: true, metal: true },
  belt: { physical: '#2E3236', digital: '#0F4A66', glow: 0.5 },
  beltFrame: { physical: '#9EA6AE', digital: '#1E7FA8', metal: true },
  machine: { physical: '#7C858E', digital: '#123A55', metal: true },
  hatch: { physical: '#1F2328', digital: '#03080F' },
  box: { physical: '#C99A64', digital: '#FFD58A', glow: 0.9 },
  tape: { physical: '#EEDDB5', digital: '#FFF1D1', glow: 0.9 },
  dented: { physical: '#8F6A45', digital: '#FF6B5E', glow: 0.9 },
  cloud: { physical: '#FAFBFC', digital: '#1A3B5C' },
  rack: { physical: '#1D3A5C', digital: '#0E2C49' },
  it: { physical: '#2F7BD0', digital: '#59E3FF', glow: 0.6 },
  robot: { physical: '#F3F3F0', digital: '#DDF7FF' },
  ok: { physical: '#36D27A', digital: '#36D27A', glow: 1.6 },
  stop: { physical: '#FF4234', digital: '#FF4234', glow: 1.6 },
  off: { physical: '#3A3F45', digital: '#1B2B3A' },
  builder: { physical: '#E3B23C', digital: '#E3B23C' },
  infrastructure: { physical: '#3E7CB1', digital: '#3E7CB1' },
  user: { physical: '#E07A3F', digital: '#E07A3F' },
  carrier: { physical: '#9A9A9A', digital: '#9A9A9A' },
  trousers: { physical: '#3A3F47', digital: '#3A3F47' },
  skin0: { physical: '#8D5524', digital: '#8D5524' },
  skin1: { physical: '#C68642', digital: '#C68642' },
  skin2: { physical: '#E0AC69', digital: '#E0AC69' },
  skin3: { physical: '#F1C27D', digital: '#F1C27D' },
};
const SKY = { physical: new THREE.Color('#DCE3E6'), digital: new THREE.Color('#040B14') };

const MATERIALS = Object.fromEntries(Object.entries(LOOKS).map(([name, look]) => [name, create(look)]));

function create({ physical, glow, metal }) {
  return new THREE.MeshStandardMaterial({
    color: physical,
    roughness: metal ? 0.5 : 0.85,
    metalness: metal ? 0.15 : 0,
    emissive: glow ? physical : '#000000',
    emissiveIntensity: 0,
  });
}

export function material(name) {
  return MATERIALS[name];
}

export function sky(digital) {
  return SKY.physical.clone().lerp(SKY.digital, digital);
}

// Blends every surface between its physical and digital look: walls fade away, and the
// product, belts and cables start to glow.
export function setDigital(digital) {
  Object.entries(LOOKS).forEach(([name, look]) => {
    const surface = MATERIALS[name];
    surface.color.set(look.physical).lerp(new THREE.Color(look.digital), digital);
    if (look.glow) surface.emissive.copy(surface.color);
    if (look.glow) surface.emissiveIntensity = look.physical === look.digital ? look.glow : look.glow * digital;
    if (look.fade) fade(surface, digital);
  });
}

function fade(surface, digital) {
  if (surface.transparent !== digital > 0) surface.needsUpdate = true;
  surface.transparent = digital > 0;
  surface.opacity = 1 - 0.85 * digital;
  surface.depthWrite = digital < 0.5;
}

// Lights that switch between ok and stop share these, so a light is a choice of
// material, not a new one.
export function light(on) {
  return on ? MATERIALS[on] : MATERIALS.off;
}
