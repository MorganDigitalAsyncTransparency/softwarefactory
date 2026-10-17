import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';
import { captionSpan } from '../film/animation/caption.js';

const scenes = parseScript(readFileSync('film/script/script.md', 'utf8'));

test('scene times follow each other with no gap or overlap', () => {
  scenes.slice(1).forEach((scene, index) => assert.equal(scene.start, scenes[index].end, scene.id));
});

test('every scene lasts some time', () => {
  scenes.forEach((scene) => assert.ok(scene.end > scene.start, scene.id));
});

test('the film ends within the length the brief allows', () => {
  const [, longest] = readFileSync('film/README.md', 'utf8').match(/\| Length\s*\|\s*\d+–(\d+) seconds/);
  assert.ok(scenes.at(-1).end <= Number(longest));
});

test('every caption ends within its scene, so it is shown long enough to read', () => {
  scenes
    .filter((scene) => scene.caption)
    .forEach((scene) => {
      const { end } = captionSpan(scene.caption, scene.end - scene.start, false);
      assert.ok(scene.end - scene.start >= end, `${scene.id} needs ${end.toFixed(1)} s`);
    });
});
