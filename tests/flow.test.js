import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPACING, boxesOn, carriedSpan, carrierAt, gateStops, stretches } from '../film/animation/flow.js';
import { BELT, GAPS } from '../film/animation/layout.js';
import { gapsLaid } from '../film/animation/schedule.js';

test('a lane is cut at every gap that is still carried, and after a hand-carried gap boxes come unevenly', () => {
  const { A, B } = GAPS[1];
  const pieces = stretches({ gaps: { A2: 'robot' }, ends: {}, laid: {} }, 1);
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
  [['A', 0], ['B', 4]].forEach(([gap, laneIndex]) => {
    const tip = (buildShare) => carriedSpan({ laid: gapsLaid(buildShare) }, gap, laneIndex).start;
    const { start, end } = GAPS[laneIndex][gap];
    assert.ok(start < tip(0) && tip(0) < tip(0.5) && tip(0.5) < tip(1));
    assert.ok(tip(1) - start < (end - start) / 2);
  });
  assert.equal(carriedSpan({ laid: gapsLaid(1) }, 'B', 1).start, GAPS[1].B.start);
});

test('a closed gap and a gate join the belts, and the gate stands where the gap was', () => {
  const pieces = stretches({ gaps: { A1: 'closed', B1: 'gate' }, ends: {}, laid: {} }, 0);
  assert.deepEqual(pieces.map(({ start, end, gates }) => [start, end, gates]), [[BELT.start, BELT.end, [(GAPS[0].B.start + GAPS[0].B.end) / 2]]]);
});

test('an even belt in the middle carries good boxes on a steady beat, with a box missing here and there', () => {
  const stretch = stretches({ gaps: {}, ends: {}, laid: {} }, 0)[0];
  const long = { ...stretch, start: 0, end: 100 };
  const boxes = boxesOn(long, 60);
  const offBeat = (box) => Math.abs(Math.round(box.x / SPACING) * SPACING - box.x) > 1e-9;
  const missing = boxesOn({ ...long, missing: 0 }, 60).length - boxes.length;
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
