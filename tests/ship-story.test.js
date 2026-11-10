import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, isBroken, stageAt } from '../ship/src/story.js';

test('the story starts by hand and ends with the city of factories', () => {
  assert.equal(stageAt(0), 0);
  assert.equal(stageAt(STAGES.at(-1).from), STAGES.length - 1);
  assert.equal(STAGES.at(-1).city, true);
});

test('each stage starts at its count and holds until the next', () => {
  STAGES.forEach((stage, index) => {
    assert.equal(stageAt(stage.from), index);
    if (index) assert.equal(stageAt(stage.from - 1), index - 1);
  });
});

test('gates come before automation, and automation before more lanes', () => {
  const first = (key) => STAGES.findIndex((stage) => stage[key]);
  assert.ok(first('gates') < first('robots'));
  assert.ok(first('robots') < STAGES.findIndex((stage) => stage.lanes > 1));
});

test('a count below zero or not a number opens at the start', () => {
  assert.equal(stageAt(-1), 0);
  assert.equal(stageAt(Number.NaN), 0);
});

test('a small share of changes is broken', () => {
  assert.equal(isBroken(0.05), true);
  assert.equal(isBroken(0.5), false);
});
