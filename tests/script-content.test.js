import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';

const scenes = parseScript(readFileSync('film/script/script.md', 'utf8'));
const READING_SECONDS_PER_WORD = 1 / 3;
const READING_BASE_SECONDS = 2;

test('scene times follow each other with no gap or overlap', () => {
  scenes.slice(1).forEach((scene, index) => assert.equal(scene.start, scenes[index].end, scene.id));
});

test('every scene lasts some time', () => {
  scenes.forEach((scene) => assert.ok(scene.end > scene.start, scene.id));
});

test('the film ends within the 120 seconds the brief allows', () => {
  assert.ok(scenes.at(-1).end <= 120);
});

test('every intertitle is shown long enough to read', () => {
  scenes
    .filter((scene) => scene.type === 'intertitle')
    .forEach((scene) => {
      const words = scene.text.split(/\s+/).length;
      const needed = words * READING_SECONDS_PER_WORD + READING_BASE_SECONDS;
      assert.ok(scene.end - scene.start >= needed, `${scene.id} needs ${needed.toFixed(1)} s`);
    });
});
