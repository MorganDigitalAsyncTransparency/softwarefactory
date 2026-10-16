import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wanderAt } from '../film/animation/wander.js';
import { AISLES } from '../film/animation/layout.js';

const STEP = 0.05;

test('people who wander stay in their aisle and never jump', () => {
  Object.values(AISLES).forEach((area) => [1, 2, 3, 4].forEach((seed) => {
    let before = wanderAt({ area, seed }, 0);
    for (let time = STEP; time < 150; time += STEP) {
      const now = wanderAt({ area, seed }, time);
      assert.ok(now.x >= area.x[0] && now.x <= area.x[1] && now.z >= area.z[0] && now.z <= area.z[1]);
      assert.ok(Math.hypot(now.x - before.x, now.z - before.z) <= 1.5 * STEP);
      before = now;
    }
  }));
});

test('people who wander both walk and stop to work, at the same place for the same time', () => {
  const area = AISLES.front;
  const moved = Array.from({ length: 200 }, (_, step) => step * 0.5).map((time) => (
    Math.hypot(wanderAt({ area, seed: 1 }, time + 0.1).x - wanderAt({ area, seed: 1 }, time).x) > 0
  ));
  assert.ok(moved.includes(true) && moved.includes(false));
  assert.deepEqual(wanderAt({ area, seed: 1 }, 42), wanderAt({ area, seed: 1 }, 42));
});
