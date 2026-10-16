import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BELT, GAPS, INTAKE, INTAKE_TESTS, OUTPUT, OUTPUT_TESTS, TESTS, beltsLaid, hallBuilt,
} from '../film/animation/layout.js';

const inside = (x, { start, end }) => x > start && x < end;

test('every belt passes at least two test stations, from the first frame', () => {
  assert.ok(INTAKE_TESTS.length >= 2 && INTAKE_TESTS.every((x) => inside(x, INTAKE)));
  assert.ok(OUTPUT_TESTS.length >= 2 && OUTPUT_TESTS.every((x) => inside(x, OUTPUT)));
  const laidAtStart = Math.min(...Object.values(beltsLaid(0)));
  const builtFromStart = [{ start: BELT.start, end: GAPS.A.start }, { start: GAPS.A.end, end: Math.min(GAPS.B.start, laidAtStart) }];
  assert.ok(TESTS.length >= 2 && TESTS.every((x) => builtFromStart.some((piece) => inside(x, piece))));
});

test('the factory is never finished: the hall and the unfinished belts still grow at the end', () => {
  assert.ok(hallBuilt(0) < hallBuilt(1) && hallBuilt(1) < 1);
  Object.entries(beltsLaid(1)).forEach(([laneIndex, end]) => {
    assert.ok(end > beltsLaid(0)[laneIndex] && end < BELT.end, `lane ${laneIndex}`);
  });
  assert.ok(Object.keys(beltsLaid(1)).length >= 2);
});
