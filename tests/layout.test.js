import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASSEMBLY, BELT, BELT_WORKERS, GAPS, INTAKE, INTAKE_TESTS, LANES, NEW_LANE, OUTPUT, OUTPUT_TESTS, SERVER_ROOM, TESTS,
  beltsLaid, hallBuilt, middleTests, newLaneLaid, racksBuilt, roomRacksBuilt, stationBuilt, unfinishedStations,
} from '../film/animation/layout.js';

const inside = (x, { start, end }) => x > start && x < end;
// A person's radius, as drawn in film/animation/figures.js.
const BODY = 0.24;
const WORKERS_REACH = Math.max(...BELT_WORKERS) + BODY;
const NEW = NEW_LANE.index;
const BELTS = [
  ...LANES.flatMap((_, laneIndex) => [['intake', laneIndex, INTAKE_TESTS], ['middle', laneIndex, middleTests(laneIndex)]]),
  ['output', 0, OUTPUT_TESTS],
];
const NEW_BELTS = [['intake', NEW, INTAKE_TESTS], ['middle', NEW, middleTests(NEW)]];
const keysOf = ([kind, laneIndex, xs]) => xs.map((_, index) => `${kind} ${laneIndex} ${index}`);
const standing = (filmShare) => (key) => stationBuilt(key, filmShare) > 0;

test('the stations are placed on the belts they test', () => {
  assert.ok(INTAKE_TESTS.every((x) => inside(x, INTAKE)) && OUTPUT_TESTS.every((x) => inside(x, OUTPUT)));
  assert.ok(TESTS.every((x) => inside(x, BELT)) && TESTS.every((x) => !inside(x, GAPS.A) && !inside(x, GAPS.B)));
});

test('a belt still being laid has stations only where it is laid from the first frame', () => {
  Object.entries(beltsLaid(0)).forEach(([laneIndex, end]) => {
    assert.ok(Math.max(...middleTests(Number(laneIndex))) + 1.2 < end, `lane ${laneIndex}`);
  });
});

test('the new lane is laid in order, and its stations rise only on laid belt', () => {
  const at = (filmShare) => newLaneLaid(filmShare);
  for (let filmShare = 0; filmShare <= 1; filmShare += 0.01) {
    const { intake, joiner, middle } = at(filmShare);
    assert.ok(joiner === 0 || intake === INTAKE.end, `joiner at ${filmShare}`);
    assert.ok(middle === at(0).middle || joiner === 1, `belt at ${filmShare}`);
    INTAKE_TESTS.forEach((x, index) => assert.ok(stationBuilt(`intake ${NEW} ${index}`, filmShare) === 0 || intake > x + 1));
    middleTests(NEW).forEach((x, index) => assert.ok(stationBuilt(`middle ${NEW} ${index}`, filmShare) === 0 || middle > x + 1));
  }
});

test('the server room port sits on a rack that stands from the first frame', () => {
  assert.ok(roomRacksBuilt(0) >= 1 && SERVER_ROOM.port.x === Math.min(...[25.6, 27.6, 29.6]));
});

test('every running belt has two test stations from the first frame, at least one of them working', () => {
  BELTS.forEach((belt) => {
    const keys = keysOf(belt);
    assert.ok(keys.filter(standing(0)).length >= 2, keys[0]);
    assert.ok(keys.some((key) => stationBuilt(key, 0) === 1), keys[0]);
  });
});

test('every station built during the film is a real one', () => {
  const keys = [...BELTS, ...NEW_BELTS].flatMap(keysOf);
  unfinishedStations().forEach((key) => assert.ok(keys.includes(key), key));
});

test('about half of the test stations are built while the film runs, spread over all of it', () => {
  const all = [...BELTS, ...NEW_BELTS].flatMap(keysOf);
  const during = all.filter((key) => stationBuilt(key, 0) < 1);
  assert.ok(Math.abs(during.length / all.length - 0.5) < 0.1, `${during.length} of ${all.length}`);
  for (let filmShare = 0; filmShare <= 1; filmShare += 0.01) {
    assert.ok(during.some((key) => stationBuilt(key, filmShare) > 0 && stationBuilt(key, filmShare) < 1), `at ${filmShare}`);
  }
});

test('the factory is never finished: the hall, the IT and some belts and stations still grow at the end', () => {
  assert.ok(hallBuilt(0) < hallBuilt(1) && hallBuilt(1) < 1);
  [racksBuilt, roomRacksBuilt].forEach((built) => assert.ok(built(0) < built(1) && !Number.isInteger(built(1))));
  Object.entries(beltsLaid(1)).forEach(([laneIndex, end]) => {
    assert.ok(end > beltsLaid(0)[laneIndex] && end + WORKERS_REACH < ASSEMBLY.start, `lane ${laneIndex}`);
  });
  assert.ok(newLaneLaid(1).middle < BELT.end);
  assert.ok(unfinishedStations().some((key) => stationBuilt(key, 1) < 1));
});
