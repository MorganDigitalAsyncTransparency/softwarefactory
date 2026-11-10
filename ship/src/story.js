// Pure: the story told by the number of changes shipped. Each stage adds one idea of
// the software factory, and the viewer's taps move it on faster.
export const STAGES = [
  { from: 0, lanes: 1, spawn: 1.0, caption: 'Changes are carried by hand. Some arrive broken.' },
  { from: 4, lanes: 1, spawn: 0.9, gates: true, caption: 'Gates stop what is broken.' },
  { from: 10, lanes: 1, spawn: 0.5, gates: true, robots: true, caption: 'Automation takes over the carrying.' },
  { from: 18, lanes: 5, spawn: 0.9, gates: true, robots: true, caption: 'More teams. More belts. The same gates.' },
  { from: 40, lanes: 5, spawn: 0.8, gates: true, robots: true, hall: true, caption: 'The factory builds itself while it ships.' },
  { from: 80, lanes: 5, spawn: 0.8, gates: true, robots: true, hall: true, city: true, caption: 'Every light is a team that ships.' },
];

const BROKEN_SHARE = 0.18;

export const FINALE = STAGES.length - 1;

export function stageAt(shipped) {
  return Math.max(0, STAGES.findLastIndex((stage) => shipped >= stage.from));
}

export function isBroken(random) {
  return random < BROKEN_SHARE;
}
