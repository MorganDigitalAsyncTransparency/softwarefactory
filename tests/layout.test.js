import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ASSEMBLY, BELT, BELT_WORKERS, CRAWLING_GATE, GAPS, INTAKE, INTAKE_TESTS, LANES, NEW_LANE, OUTPUT, OUTPUT_TESTS, SERVER_ROOM, TESTS,
} from '../film/animation/layout.js';
import {
  beltsLaid, hallBuilt, middleTests, newLaneLaid, racksBuilt, racksUpgraded, roomRacksBuilt, gateRisen, stationBuilt, stationsBuiltDuringFilm,
} from '../film/animation/schedule.js';

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
const standing = (buildShare) => (key) => stationBuilt(key, buildShare) > 0;
const rising = (buildShare) => (key) => stationBuilt(key, buildShare) > 0 && stationBuilt(key, buildShare) < 1;
const shares = Array.from({ length: 101 }, (_, step) => step / 100);

test('the stations are placed on the belts they test', () => {
  assert.ok(INTAKE_TESTS.every((x) => inside(x, INTAKE)) && OUTPUT_TESTS.every((x) => inside(x, OUTPUT)));
  assert.ok(TESTS.every((x) => inside(x, BELT)) && TESTS.every((x) => GAPS.every(({ A, B }) => !inside(x, A) && !inside(x, B))));
});

test('a belt still being laid has stations only where it is laid from the first frame', () => {
  Object.entries(beltsLaid(0)).forEach(([laneIndex, end]) => {
    assert.ok(Math.max(...middleTests(Number(laneIndex))) + 1.2 < end, `lane ${laneIndex}`);
  });
});

test('the new lane is laid in order, and its stations rise only on laid belt', () => {
  shares.forEach((buildShare) => {
    const { intake, joiner, middle } = newLaneLaid(buildShare);
    assert.ok(joiner === 0 || intake === INTAKE.end, `joiner at ${buildShare}`);
    assert.ok(middle === newLaneLaid(0).middle || joiner === 1, `belt at ${buildShare}`);
    INTAKE_TESTS.forEach((x, index) => assert.ok(stationBuilt(`intake ${NEW} ${index}`, buildShare) === 0 || intake > x + 1));
    middleTests(NEW).forEach((x, index) => assert.ok(stationBuilt(`middle ${NEW} ${index}`, buildShare) === 0 || middle > x + 1));
  });
});

test('the server room has a rack from the first frame and room for every rack it installs', () => {
  assert.ok(roomRacksBuilt(0) >= 1 && roomRacksBuilt(1) < SERVER_ROOM.racks.length);
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
  stationsBuiltDuringFilm().forEach((key) => assert.ok(keys.includes(key), key));
});

test('about half of the test stations are built while the film runs, spread over all of it', () => {
  const all = [...BELTS, ...NEW_BELTS].flatMap(keysOf);
  const during = all.filter((key) => stationBuilt(key, 0) < 1);
  assert.ok(Math.abs(during.length / all.length - 0.5) < 0.1, `${during.length} of ${all.length}`);
  assert.ok(during.filter(standing(0)).length <= 2, 'begun before the film');
  shares.forEach((buildShare) => {
    const count = during.filter(rising(buildShare)).length;
    assert.ok(count >= 1 && count <= 3, `${count} at ${buildShare}`);
  });
});

test('the factory is never finished: the hall, the IT and some belts and stations still grow at the end', () => {
  assert.ok(hallBuilt(0) < hallBuilt(1) && hallBuilt(1) < 1);
  [racksBuilt, roomRacksBuilt].forEach((built) => assert.ok(built(0) < built(1) && !Number.isInteger(built(1))));
  Object.entries(beltsLaid(1)).forEach(([laneIndex, end]) => {
    assert.ok(end > beltsLaid(0)[laneIndex] && end + WORKERS_REACH < ASSEMBLY.start, `lane ${laneIndex}`);
  });
  assert.ok(newLaneLaid(1).middle < BELT.end);
  assert.ok(stationsBuiltDuringFilm().some((key) => stationBuilt(key, 1) < 1));
});

test('a gate that crawls rises all film long and is less than half up in the last frame', () => {
  const [first, middle, last] = [0, 0.5, 1].map(gateRisen);
  const { lane, x } = CRAWLING_GATE;
  assert.ok(first > 0 && first < middle && middle < last && last < 0.5);
  assert.ok(!inside(x, GAPS[lane].A) && !inside(x, GAPS[lane].B) && TESTS.every((test) => Math.abs(test - x) > 1.2));
});

test('IT upgrades racks in the cloud for the new boxes one after the other, only racks that stand', () => {
  const upgraded = [0, 0.5, 1].map(racksUpgraded);
  assert.ok(upgraded[0] < 1 && upgraded[0] < upgraded[1] && upgraded[1] < upgraded[2] && upgraded[2] >= 3);
  [0, 0.25, 0.5, 0.75, 1].forEach((share) => assert.ok(Math.floor(racksUpgraded(share)) <= Math.floor(racksBuilt(share))));
});
