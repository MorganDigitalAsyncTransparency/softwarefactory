import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPACING, boxesOn, carrierAt, gateStops, stretches } from '../film/animation/flow.js';
import { BELT, GAPS } from '../film/animation/layout.js';

test('a lane is cut at every gap that is still carried, and after a hand-carried gap boxes come unevenly', () => {
  const pieces = stretches({ gaps: { A1: 'robot' } }, 0);
  assert.deepEqual(pieces.map(({ start, end, uneven }) => [start, end, uneven]), [
    [BELT.start, GAPS.A.start, false],
    [GAPS.A.end, GAPS.B.start, false],
    [GAPS.B.end, BELT.end, true],
  ]);
});

test('a closed gap and a gate join the belts, and the gate stands where the gap was', () => {
  const pieces = stretches({ gaps: { A1: 'closed', B1: 'gate' } }, 0);
  assert.deepEqual(pieces, [{ start: BELT.start, end: BELT.end, uneven: false, gates: [(GAPS.B.start + GAPS.B.end) / 2] }]);
});

test('an even belt carries good boxes at equal spacing', () => {
  const boxes = boxesOn({ start: 0, end: 10, uneven: false, gates: [] }, 20);
  const spacings = boxes.slice(1).map((box, index) => box.x - boxes[index].x);
  assert.ok(boxes.length >= 4);
  assert.ok(spacings.every((spacing) => Math.abs(Math.abs(spacing) - SPACING) < 1e-9));
  assert.ok(boxes.every(({ look }) => look === 'good'));
});

test('a gate pushes every box that is not good off the belt and shows red while it does', () => {
  const stretch = { start: 0, end: 30, uneven: true, gates: [15] };
  const passed = [];
  for (let time = 0; time < 60; time += 0.25) passed.push(...boxesOn(stretch, time).filter(({ x }) => x > 15));
  const stopped = Array.from({ length: 240 }, (_, step) => step / 4).filter((time) => gateStops(boxesOn(stretch, time), 15));
  assert.ok(passed.length > 0 && passed.every(({ look }) => look === 'good'));
  assert.ok(stopped.length > 0);
});

test('a robot carries at a steady beat, and the same time always gives the same position', () => {
  const at = (time) => {
    const { x, carrying, facing } = carrierAt(GAPS.A, time, { robot: true });
    return { x: x.toFixed(6), carrying, facing };
  };
  assert.deepEqual(at(10), at(13));
  assert.deepEqual(at(10.4), at(10.4));
});
