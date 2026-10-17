import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPACING, boxesOn, carriedSpan, carrierAt, gateStops, stretches } from '../film/animation/flow.js';
import { BELT, GAPS } from '../film/animation/layout.js';

test('a lane is cut at every gap that is still carried, and after a hand-carried gap boxes come unevenly', () => {
  const { A, B } = GAPS[1];
  const pieces = stretches({ gaps: { A2: 'robot' }, ends: {} }, 1);
  assert.deepEqual(pieces.map(({ start, end, uneven }) => [start, end, uneven]), [
    [BELT.start, A.start, false],
    [A.end, B.start, false],
    [B.end, BELT.end, true],
  ]);
});

test('the gaps lie differently on every lane', () => {
  const places = GAPS.map(({ A, B }) => JSON.stringify([A, B]));
  assert.equal(new Set(places).size, GAPS.length);
});

test('a belt is laid into some gaps so slowly that it is still far from across in the last frame', () => {
  const tip = (buildShare) => carriedSpan({ buildShare }, 'A', 0).start;
  const { start, end } = GAPS[0].A;
  assert.ok(start < tip(0) && tip(0) < tip(0.5) && tip(0.5) < tip(1));
  assert.ok(tip(1) - start < (end - start) / 2);
  assert.equal(carriedSpan({ buildShare: 1 }, 'B', 1).start, GAPS[1].B.start);
});

test('a closed gap and a gate join the belts, and the gate stands where the gap was', () => {
  const pieces = stretches({ gaps: { A1: 'closed', B1: 'gate' }, ends: {} }, 0);
  assert.deepEqual(pieces, [{ start: BELT.start, end: BELT.end, uneven: false, gates: [(GAPS[0].B.start + GAPS[0].B.end) / 2] }]);
});

test('an even belt carries good boxes on a steady beat, with a box missing here and there', () => {
  const stretch = { start: 0, end: 100, uneven: false, gates: [] };
  const boxes = boxesOn(stretch, 60);
  const offBeat = (box) => Math.abs(Math.round(box.x / SPACING) * SPACING - box.x) > 1e-9;
  const missing = Math.round(stretch.end / SPACING) - boxes.length;
  assert.ok(boxes.every(({ look }) => look === 'good') && !boxes.some(offBeat));
  assert.ok(missing > 0 && missing < boxes.length / 4);
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
    const { x, carrying, facing } = carrierAt(GAPS[0].A, time, { robot: true });
    return { x: x.toFixed(6), carrying, facing };
  };
  assert.deepEqual(at(10), at(13));
  assert.deepEqual(at(10.4), at(10.4));
});

test('a person now and then carries nothing for a whole round', () => {
  const xs = Array.from({ length: 4000 }, (_, step) => carrierAt(GAPS[0].A, step / 4, { seed: 3 }).x);
  const longestRest = xs.reduce(({ run, best }, x, step) => {
    const still = step > 0 && x === xs[step - 1] ? run + 1 : 0;
    return { run: still, best: Math.max(best, still) };
  }, { run: 0, best: 0 }).best;
  assert.ok(longestRest / 4 >= 4.5);
});
