import { test } from 'node:test';
import assert from 'node:assert/strict';
import { duration, fade, frameAt, startTimeFrom } from '../film/animation/timeline.js';

const scenes = [
  { id: 'S01', start: 0, end: 4 },
  { id: 'S02', start: 4, end: 12 },
];

test('the duration is the end of the last scene', () => {
  assert.equal(duration(scenes), 12);
});

test('finds the scene at a time and how far into it the time is', () => {
  assert.deepEqual(frameAt(scenes, 6), { scene: scenes[1], progress: 0.25 });
});

test('a time on a boundary belongs to the scene that starts there', () => {
  assert.equal(frameAt(scenes, 4).scene.id, 'S02');
});

test('a time past the end shows the last frame', () => {
  assert.deepEqual(frameAt(scenes, 99), { scene: scenes[1], progress: 1 });
});

test('reads a start time from ?t=', () => {
  assert.equal(startTimeFrom('?t=45.5'), 45.5);
});

test('has no start time without a valid ?t=', () => {
  assert.equal(startTimeFrom(''), null);
  assert.equal(startTimeFrom('?t=soon'), null);
  assert.equal(startTimeFrom('?t=Infinity'), null);
});

test('a fade rises at the start, holds, and falls at the end', () => {
  assert.deepEqual([0, 0.25, 2, 3.75, 4].map((seconds) => fade(seconds, 4, 0.5)), [0, 0.5, 1, 0.5, 0]);
});
