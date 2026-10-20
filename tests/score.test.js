import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';
import { frameAt } from '../film/animation/timeline.js';
import { draw, lineTime } from '../film/animation/scenes.js';
import { events, levels } from '../film/animation/score.js';
import { CRANE } from '../film/animation/layout.js';
import { notesBetween } from '../film/animation/music.js';

const scenes = parseScript(readFileSync('film/script/script.md', 'utf8'));
const clockAt = (film) => ({ film, line: lineTime(scenes, film) });
const shotAt = (film) => draw(frameAt(scenes, film));
const at = (film) => ({ shot: shotAt(film), clock: clockAt(film) });
const STEP = 0.05;
const times = Array.from({ length: Math.floor(scenes.at(-1).end / STEP) }, (_, index) => index * STEP);
const finale = lineTime(scenes, scenes.at(-1).start);
const heard = (from, to) => events(at(from), at(to), finale);

test('the alarm sounds exactly while the cloud is down, and the belts go quiet', () => {
  times.forEach((film) => {
    const shot = shotAt(film);
    const { alert, hum } = levels(shot, clockAt(film), false);
    if (shot.state?.outage) assert.ok(alert.level === 1 && hum < 1, `at ${film}`);
    else if (!shot.split) assert.equal(alert.level, 0, `at ${film}`);
  });
});

test('the split panels sound a warning once their lights turn red', () => {
  const split = times.filter((film) => shotAt(film).split);
  assert.ok(split.some((film) => levels(shotAt(film), clockAt(film), false).alert.level > 0));
  assert.equal(levels(shotAt(split[0]), clockAt(split[0]), false).alert.level, 0);
});

test('the music steps back while the voice reads a caption', () => {
  const music = (speaking) => levels(shotAt(10), clockAt(10), speaking).music;
  assert.equal(music(false), 1);
  assert.ok(music(true) < 1);
});

test('the music and the station clicks stop with the belts while the cloud is down', () => {
  const halted = times.filter((film) => shotAt(film).state?.outage).slice(1);
  assert.ok(halted.length > 10);
  halted.forEach((film) => {
    assert.deepEqual(heard(film - STEP, film).filter(({ kind }) => ['note', 'click'].includes(kind)), [], `at ${film}`);
  });
});

test('the music halts in the uneven scene, leaving out notes it would play elsewhere', () => {
  const scene = scenes.find((candidate) => draw({ scene: candidate, progress: 0.5 }).uneven);
  const notes = (shot) => events({ shot, clock: clockAt(scene.start) }, { shot, clock: clockAt(scene.end) }, finale)
    .filter(({ kind }) => kind === 'note').length;
  const shot = draw({ scene, progress: 0.5 });
  assert.ok(notes(shot) < 0.8 * notes({ ...shot, uneven: false }));
});

test('the music starts with the film and its closing chord lands as the last scene begins', () => {
  assert.ok(heard(0, STEP).some(({ kind }) => kind === 'note'));
  const sounding = times.slice(1).filter((film) => heard(film - STEP, film).some(({ kind }) => kind === 'note'));
  const last = scenes.at(-1).start;
  assert.ok(Math.abs(sounding.at(-1) - last) < 1.5 * STEP, `last notes at ${sounding.at(-1)}, last scene at ${last}`);
  assert.equal(new Set(notesBetween(finale - 0.01, finale + 0.01, finale).map(({ step }) => step)).size, 1);
});

test('the theme plays faster towards the end', () => {
  const steps = (from, to) => new Set(notesBetween(lineTime(scenes, from), lineTime(scenes, to), finale).map(({ step }) => step)).size;
  assert.ok(steps(125, 135) > 1.5 * steps(5, 15));
});

test('the crane thuds once each time it sets a panel in view', () => {
  const thuds = times.slice(1).filter((film) => heard(film - STEP, film).some(({ kind }) => kind === 'thud'));
  const lifts = times.at(-1) / CRANE.liftSeconds;
  assert.ok(thuds.length >= lifts - 2 && thuds.length <= lifts, `${thuds.length} thuds`);
  thuds.forEach((film) => assert.ok(shotAt(film).state, `no crane in view at ${film}`));
  thuds.slice(1).forEach((film, index) => assert.ok(film - thuds[index] >= CRANE.liftSeconds - STEP));
});

test('a jump plays nothing it skipped', () => {
  assert.deepEqual(events(at(100), at(100), finale), []);
});
