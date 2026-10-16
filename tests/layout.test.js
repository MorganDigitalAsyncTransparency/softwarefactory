import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASSEMBLY, BELT, BELT_WORKERS, GAPS, INTAKE, INTAKE_TESTS, LANES, OUTPUT, OUTPUT_TESTS, TESTS, beltsLaid, hallBuilt,
  racksBuilt, stationBuilt, unfinishedStations,
} from '../film/animation/layout.js';

const inside = (x, { start, end }) => x > start && x < end;
const BODY = 0.24;
const WORKERS_REACH = Math.max(...BELT_WORKERS) + BODY;
const BELTS = [
  ...LANES.flatMap((_, laneIndex) => [['intake', laneIndex, INTAKE_TESTS], ['middle', laneIndex, TESTS]]),
  ['output', 0, OUTPUT_TESTS],
];

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
  const all = BELTS.reduce((count, [, , xs]) => count + xs.length, 0);
  const building = unfinishedStations().filter((key) => stationBuilt(key, 0) < 1).length;
  assert.ok(Math.abs(building / all - 0.3) < 0.05, `${building} of ${all}`);
});

test('every station still being built is a real one, and every belt has a working station from the start', () => {
  const keys = BELTS.flatMap(([kind, laneIndex, xs]) => xs.map((_, index) => `${kind} ${laneIndex} ${index}`));
  unfinishedStations().forEach((key) => assert.ok(keys.includes(key), key));
  BELTS.forEach(([kind, laneIndex, xs]) => {
    assert.ok(xs.some((_, index) => stationBuilt(`${kind} ${laneIndex} ${index}`, 0) === 1), `${kind} ${laneIndex}`);
  });
});
