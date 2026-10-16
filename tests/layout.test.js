import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASSEMBLY, BELT, GAPS, INTAKE, INTAKE_TESTS, LANES, OUTPUT, OUTPUT_TESTS, TESTS, beltsLaid, hallBuilt, racksBuilt,
  stationBuilt, unfinishedStations,
} from '../film/animation/layout.js';

const inside = (x, { start, end }) => x > start && x < end;
// The developers laying a belt stand up to this far past its end.
const WORKERS_REACH = 1.7;

test('every belt passes at least two test stations, on belt that stands from the first frame', () => {
  assert.ok(INTAKE_TESTS.length >= 2 && INTAKE_TESTS.every((x) => inside(x, INTAKE)));
  assert.ok(OUTPUT_TESTS.length >= 2 && OUTPUT_TESTS.every((x) => inside(x, OUTPUT)));
  const builtFromStart = [{ start: BELT.start, end: GAPS.A.start }, { start: GAPS.A.end, end: GAPS.B.start }];
  assert.ok(TESTS.length >= 2 && TESTS.every((x) => builtFromStart.some((piece) => inside(x, piece))));
});

test('the factory is never finished: the hall, the cloud and some belts and stations still grow at the end', () => {
  assert.ok(hallBuilt(0) < hallBuilt(1) && hallBuilt(1) < 1);
  assert.ok(racksBuilt(0) < racksBuilt(1) && !Number.isInteger(racksBuilt(1)));
  Object.entries(beltsLaid(1)).forEach(([laneIndex, end]) => {
    assert.ok(end > beltsLaid(0)[laneIndex] && end + WORKERS_REACH < ASSEMBLY.start, `lane ${laneIndex}`);
  });
  assert.ok(Object.keys(beltsLaid(1)).length >= 2);
  assert.ok(unfinishedStations().some((key) => stationBuilt(key, 1) < 1));
});

test('about a third of the test stations are still being built when the film starts', () => {
  const all = (INTAKE_TESTS.length + TESTS.length) * LANES.length + OUTPUT_TESTS.length;
  const building = unfinishedStations().filter((key) => stationBuilt(key, 0) < 1).length;
  assert.ok(Math.abs(building / all - 0.3) < 0.05, `${building} of ${all}`);
});
