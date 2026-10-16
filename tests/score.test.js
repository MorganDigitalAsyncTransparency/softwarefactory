import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';
import { frameAt } from '../film/animation/timeline.js';
import { draw, lineTime } from '../film/animation/scenes.js';
import { events, levels } from '../film/animation/score.js';
import { CRANE } from '../film/animation/layout.js';

const scenes = parseScript(readFileSync('film/script/script.md', 'utf8'));
const clockAt = (film) => ({ film, line: lineTime(scenes, film) });
const shotAt = (film) => draw(frameAt(scenes, film));
const STEP = 0.05;
const times = Array.from({ length: Math.floor(scenes.at(-1).end / STEP) }, (_, index) => index * STEP);
const heard = (from, to) => events(shotAt(to), clockAt(from), clockAt(to));

test('the alarm sounds exactly while the cloud is down, and the belts go quiet', () => {
  times.forEach((film) => {
    const shot = shotAt(film);
    const { alert, hum } = levels(shot, clockAt(film));
    if (shot.state?.outage) assert.ok(alert.level === 1 && hum < 1, `at ${film}`);
    else if (!shot.split) assert.equal(alert.level, 0, `at ${film}`);
  });
});

test('the split panels sound a warning once their lights turn red', () => {
  const split = times.filter((film) => shotAt(film).split);
  assert.ok(split.some((film) => levels(shotAt(film), clockAt(film)).alert.level > 0));
  assert.equal(levels(shotAt(split[0]), clockAt(split[0])).alert.level, 0);
});

test('the music and the station clicks stop with the belts while the cloud is down', () => {
  const halted = times.filter((film) => shotAt(film).state?.outage).slice(1);
  assert.ok(halted.length > 10);
  halted.forEach((film) => {
    assert.deepEqual(heard(film - STEP, film).filter(({ kind }) => kind !== 'thud'), [], `at ${film}`);
  });
});

test('the music halts in the uneven scene and runs evenly elsewhere', () => {
  const notes = (scene) => events(draw({ scene, progress: 0.5 }), clockAt(scene.start), clockAt(scene.end))
    .filter(({ kind }) => kind === 'note').length;
  const perSecond = (scene) => notes(scene) / (scene.end - scene.start);
  const uneven = scenes.find((scene) => draw({ scene, progress: 0.5 }).uneven);
  const even = scenes.find((scene) => scene.id === 'S05');
  assert.ok(perSecond(uneven) < 0.8 * perSecond(even));
});

test('the crane thuds once each time it sets a panel', () => {
  const thuds = times.slice(1).filter((film) => heard(film - STEP, film).some(({ kind }) => kind === 'thud'));
  assert.equal(thuds.length, Math.floor((times.at(-1) / CRANE.liftSeconds) - CRANE.setAt) + 1);
});
