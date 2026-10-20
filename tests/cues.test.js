import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';
import { frameAt } from '../film/animation/timeline.js';
import { draw } from '../film/animation/scenes.js';
import { cues } from '../film/animation/cues.js';

const scenes = parseScript(readFileSync('film/script/script.md', 'utf8'));
const at = (film) => ({ shot: draw(frameAt(scenes, film)), clock: { film } });
const STEP = 0.05;
const times = Array.from({ length: Math.floor(scenes.at(-1).end / STEP) }, (_, index) => index * STEP);
const when = (kind) => times.filter((film, index) => index && cues(at(times[index - 1]), at(film)).some((cue) => cue.kind === kind));
const sceneAt = (film) => frameAt(scenes, film).scene.id;

test('the cloud powers down once as it fails and up once as it comes back', () => {
  const [down, up] = [when('powerDown'), when('powerUp')];
  assert.equal(down.length, 1);
  assert.equal(up.length, 1);
  assert.ok(at(down[0]).shot.state.outage && !at(up[0]).shot.state.outage && up[0] > down[0]);
});

test('a gate and a closed gap clank into place, but not on a cut, a robot whirs in and the fitted gate chimes', () => {
  assert.deepEqual(when('clank').map(sceneAt), ['S12', 'S13']);
  assert.deepEqual(when('whirr').map(sceneAt), ['S13']);
  assert.deepEqual(when('chime').map(sceneAt), ['S12']);
});

test('each speech bubble starts with a blip', () => {
  assert.deepEqual(when('blip').map(sceneAt), ['S12', 'S12']);
});

test('the picture turning digital and back shimmers once each way', () => {
  assert.deepEqual(when('shimmer').map(sceneAt), ['S14', 'S15']);
});

test('a frame compared with itself, as after a jump, cues nothing', () => {
  times.forEach((film) => assert.deepEqual(cues(at(film), at(film)), []));
});
