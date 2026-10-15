import { el, group } from './svg.js';
import { box } from './figures.js';
import { FRAME } from './layout.js';

const PANEL_WIDTH = FRAME.width / 3;
const WARNING_FROM = 0.7;

// The detail scene: factory, IT and product side by side, none of them fitting together.
export function mismatchPanels(progress, palette) {
  const drawings = [beltsAtTwoHeights, cableTooShort, partsThatDoNotFit];
  return group([
    el('rect', { ...FRAME, fill: palette.background }),
    ...drawings.map((draw, index) => panel(index, draw(index * PANEL_WIDTH + PANEL_WIDTH / 2, progress, palette), progress, palette)),
  ]);
}

function panel(index, drawing, progress, palette) {
  const x = index * PANEL_WIDTH;
  const warning = progress > WARNING_FROM ? palette.stop : palette.roller;
  return group([
    el('rect', { x: x + 12, y: 12, width: PANEL_WIDTH - 24, height: FRAME.height - 24, rx: 16, fill: palette.floor }),
    drawing,
    el('circle', { cx: x + PANEL_WIDTH / 2, cy: 90, r: 20, fill: warning }),
  ]);
}

function beltsAtTwoHeights(centerX, progress, palette) {
  const boxX = Math.min(centerX - 30, centerX - 200 + progress * 500);
  return group([
    el('rect', { x: centerX - 220, y: 470, width: 210, height: 36, fill: palette.belt }),
    el('rect', { x: centerX + 10, y: 390, width: 210, height: 36, fill: palette.belt }),
    box(boxX, 452, palette, { scale: 1.4 }),
  ]);
}

function cableTooShort(centerX, progress, palette) {
  const cableEnd = 260 + Math.min(progress / WARNING_FROM, 1) * 280;
  return group([
    el('ellipse', { cx: centerX, cy: 200, rx: 120, ry: 50, fill: palette.cloud, stroke: palette.cloudEdge, 'stroke-width': 3 }),
    el('line', { x1: centerX, y1: 240, x2: centerX, y2: cableEnd, stroke: palette.cable, 'stroke-width': 5 }),
    el('rect', { x: centerX - 16, y: cableEnd, width: 32, height: 26, rx: 3, fill: palette.cable }),
    el('rect', { x: centerX - 50, y: 690, width: 100, height: 70, rx: 12, fill: palette.wall }),
    el('circle', { cx: centerX - 16, cy: 725, r: 8, fill: palette.floor }),
    el('circle', { cx: centerX + 16, cy: 725, r: 8, fill: palette.floor }),
  ]);
}

function partsThatDoNotFit(centerX, progress, palette) {
  const closing = (1 - Math.min(progress / WARNING_FROM, 1)) * 140;
  const part = { fill: palette.box, stroke: palette.boxEdge, 'stroke-width': 3, rx: 4 };
  return group([
    el('rect', { ...part, x: centerX - 150 - closing, y: 390, width: 150, height: 150 }),
    el('rect', { ...part, x: centerX + 6 + closing, y: 430, width: 120, height: 90 }),
  ]);
}
