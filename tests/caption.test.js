import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captionSpan, wrap } from '../film/animation/caption.js';

test('keeps a short caption on one line', () => {
  assert.deepEqual(wrap('A factory.'), ['A factory.']);
});

test('wraps a long caption into balanced lines of at most 44 characters', () => {
  assert.deepEqual(wrap('The quick brown fox jumps over the lazy dog and runs far away from home.'), [
    'The quick brown fox jumps over the',
    'lazy dog and runs far away from home.',
  ]);
});

test('never leaves a single word alone on the last line when it can be avoided', () => {
  assert.deepEqual(wrap('The quick brown fox jumps over the lazy dog today.'), ['The quick brown fox jumps', 'over the lazy dog today.']);
});

test('an empty caption has no lines, so no band is shown', () => {
  assert.deepEqual(wrap(''), []);
});

test('a caption waits a second, stays as long as it takes to read and then goes', () => {
  assert.deepEqual(captionSpan('One two three four five six.', 12, false), { start: 1, end: 5 });
});

test('the closing caption stays to the end of its scene', () => {
  assert.deepEqual(captionSpan('One two three.', 6, true), { start: 1, end: 6 });
});
