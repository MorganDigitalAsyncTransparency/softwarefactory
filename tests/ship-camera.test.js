import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shotFor } from '../ship/src/camera.js';

test('a tall screen moves the camera back from the factory', () => {
  const distance = ({ position, target }) => Math.hypot(...position.map((value, axis) => value - target[axis]));
  assert.ok(distance(shotFor(2, 0, 9 / 16)) > distance(shotFor(2, 0, 16 / 9)));
});
