import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';
import { checkDrawings } from '../film/animation/scenes.js';

test('every scene in the script has a drawing', () => {
  assert.doesNotThrow(() => checkDrawings(parseScript(readFileSync('film/script/script.md', 'utf8'))));
});

test('a scene with no drawing stops the animation with an error naming it', () => {
  assert.throws(() => checkDrawings([{ id: 'S99', type: 'scene' }]), /S99/);
});

test('intertitles need no drawing', () => {
  assert.doesNotThrow(() => checkDrawings([{ id: 'S98', type: 'intertitle' }]));
});
