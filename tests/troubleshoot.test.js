import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rushAt } from '../film/animation/troubleshoot.js';

const HOME = { x: 0, z: 0, turn: 0, walked: 0 };
const AREA = { x: [-10, 10], z: [-1, 1] };
const LENGTH = 5;
const STEP = 0.01;

function during(seed, check) {
  let before = rushAt(HOME, { area: AREA, seed }, { seconds: 0, length: LENGTH });
  for (let seconds = STEP; seconds < LENGTH; seconds += STEP) {
    const now = rushAt(HOME, { area: AREA, seed }, { seconds, length: LENGTH });
    check(now, before);
    before = now;
  }
}

test('Software factory developers stay at their work while the cloud is up', () => {
  assert.deepEqual(rushAt(HOME, { area: AREA, seed: 1 }, false), HOME);
});

test('while the cloud is down they run fast within their area, never jump, and stop to inspect', () => {
  [1, 2, 3, 4].forEach((seed) => {
    const steps = [];
    let inspected = false;
    during(seed, (now, before) => {
      assert.ok(now.x >= AREA.x[0] && now.x <= AREA.x[1] && now.z >= AREA.z[0] && now.z <= AREA.z[1]);
      steps.push(Math.hypot(now.x - before.x, now.z - before.z));
      inspected ||= now.inspecting;
    });
    assert.ok(steps.every((step) => step <= 9 * STEP + 1e-9));
    assert.ok(Math.max(...steps) > 5 * STEP);
    assert.ok(inspected);
  });
});

test('they are back at their work just before the cloud is back', () => {
  [1, 2, 3, 4].forEach((seed) => {
    const end = rushAt(HOME, { area: AREA, seed }, { seconds: LENGTH - STEP, length: LENGTH });
    assert.deepEqual([end.x, end.z, end.inspecting], [HOME.x, HOME.z, false]);
  });
});
