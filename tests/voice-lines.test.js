import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spoken, voiceLines } from '../scripts/voice/lines.js';

const scene = (id, start, end, caption) => ({ id, start, end, caption });

test('the voice says CI/CD without the slash', () => {
  assert.equal(spoken('In software, this is the CI/CD pipeline.'), 'In software, this is the CI CD pipeline.');
});

test('a scene without a caption has no voice, and each line has the seconds its caption shows', () => {
  const scenes = [scene('S01', 0, 12, 'One two three four five six.'), scene('S02', 12, 20, ''), scene('S03', 20, 26, 'The end.')];
  assert.deepEqual(voiceLines(scenes), [
    { id: 'S01', text: 'One two three four five six.', seconds: 4 },
    { id: 'S03', text: 'The end.', seconds: 5 },
  ]);
});
