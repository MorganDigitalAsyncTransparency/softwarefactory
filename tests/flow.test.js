import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPACING, boxesOn, carriedSpan, carrierAt, fitting, gateSignal, stretches } from '../film/animation/flow.js';
import { BELT, GAPS } from '../film/animation/layout.js';
import { gapsLaid } from '../film/animation/schedule.js';

test('a lane is cut at every gap that is still carried, and after a hand-carried gap boxes come unevenly', () => {
  const { A, B } = GAPS[1];
  const pieces = stretches({ gaps: { A2: 'robot' }, adapted: {}, ends: {}, laid: {} }, 1);
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
  const pieces = stretches({ gaps: { A1: 'closed', B1: 'gate' }, adapted: { B1: 7 }, ends: {}, laid: {} }, 0);
  const gate = { x: (GAPS[0].B.start + GAPS[0].B.end) / 2, fittedAt: 7 };
  assert.deepEqual(pieces.map(({ start, end, gates }) => [start, end, gates]), [[BELT.start, BELT.end, [gate]]]);
});

test('an even belt in the middle carries good and new boxes on a steady beat, with a box missing here and there', () => {
  const stretch = stretches({ gaps: {}, adapted: {}, ends: {}, laid: {} }, 0)[0];
  const long = { ...stretch, start: 0, end: 100 };
  const boxes = boxesOn(long, 60);
  const offBeat = (box) => Math.abs(Math.round(box.x / SPACING) * SPACING - box.x) > 1e-9;
  const missing = boxesOn({ ...long, missing: 0 }, 60).length - boxes.length;
  assert.ok(boxes.every(({ look }) => ['good', 'new'].includes(look)) && !boxes.some(offBeat));
  assert.ok(missing > 0 && missing < boxes.length / 4);
});

const MINUTE = Array.from({ length: 240 }, (_, step) => step / 4);

function throughGate(fittedAt) {
  const stretch = { start: 0, end: 30, uneven: true, gates: [{ x: 15, fittedAt }] };
  const passed = MINUTE.flatMap((time) => boxesOn(stretch, time).filter(({ x }) => x > 15).map((box) => ({ ...box, time })));
  return {
    passed,
    looks: new Set(passed.map(({ look }) => look)),
    signals: new Set(MINUTE.map((time) => gateSignal(boxesOn(stretch, time), 15))),
  };
}

test('a gate pushes damaged boxes off the belt with a red light, and new boxes with an amber one while IT has not fitted it', () => {
  const { looks, signals } = throughGate(Infinity);
  assert.deepEqual([...looks], ['good']);
  assert.deepEqual([...signals].sort(), ['ok', 'stop', 'wait']);
});

test('a gate fitted for new boxes lets them pass and stops only damaged ones', () => {
  const { looks, signals } = throughGate(0);
  assert.deepEqual([...looks].sort(), ['good', 'new']);
  assert.deepEqual([...signals].sort(), ['ok', 'stop']);
});

test('once a gate is fitted, only new boxes that reach it from then on pass, so none jumps out of the bin', () => {
  const { passed } = throughGate(30);
  const newOnes = passed.filter(({ look }) => look === 'new');
  assert.ok(newOnes.length > 0);
  assert.ok(newOnes.every(({ x, time }) => time - (x - 15) / 2 >= 30));
});

test('IT lowers the adapter onto a gate in the seconds before it is fitted, and never onto one it has not fitted', () => {
  assert.deepEqual([7, 9, 10, 12].map((time) => fitting({ fittedAt: 10 }, time)), [0, 0.5, 1, 1]);
  assert.equal(fitting({ fittedAt: Infinity }, 1000), 0);
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
