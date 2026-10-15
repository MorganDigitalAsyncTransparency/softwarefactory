import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrap } from '../film/animation/intertitle.js';

test('keeps a short intertitle on one line', () => {
  assert.deepEqual(wrap('A factory.'), ['A factory.']);
});

test('wraps a long intertitle into balanced lines of at most 30 characters', () => {
  assert.deepEqual(wrap('The quick brown fox jumps over the lazy dog and runs far away.'), [
    'The quick brown fox',
    'jumps over the lazy',
    'dog and runs far away.',
  ]);
});

test('never leaves a single word alone on the last line when it can be avoided', () => {
  assert.deepEqual(wrap('Some parts automated, some by hand.'), ['Some parts automated,', 'some by hand.']);
});
