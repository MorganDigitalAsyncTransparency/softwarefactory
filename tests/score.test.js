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
const finale = scenes.at(-1).start;
const heard = (from, to) => events(at(from), at(to), finale);

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

test('the station clicks stop with the belts while the cloud is down, and the music plays on', () => {
  const halted = times.filter((film) => shotAt(film).state?.outage).slice(1);
  assert.ok(halted.length > 10);
  halted.forEach((film) => assert.ok(!heard(film - STEP, film).some(({ kind }) => kind === 'click'), `at ${film}`));
  const kinds = new Set(halted.flatMap((film) => heard(film - STEP, film).map(({ kind }) => kind)));
  assert.ok(kinds.has('note'));
});

test('the music never pauses for more than a held note until its closing chord', () => {
  const sounding = times.filter((film, index) => index && film <= finale && heard(times[index - 1], film).some(({ kind }) => kind === 'note'));
  sounding.slice(1).forEach((film, index) => assert.ok(film - sounding[index] < 2, `silent from ${sounding[index]} to ${film}`));
});

test('the music starts with the film and its closing chord lands as the last scene begins', () => {
  assert.ok(heard(0, STEP).some(({ kind }) => kind === 'note'));
  const sounding = times.slice(1).filter((film) => heard(film - STEP, film).some(({ kind }) => kind === 'note'));
  const last = scenes.at(-1).start;
  assert.ok(Math.abs(sounding.at(-1) - last) < 1.5 * STEP, `last notes at ${sounding.at(-1)}, last scene at ${last}`);
  assert.equal(new Set(notesBetween(finale - 0.01, finale + 0.01, finale).map(({ step }) => step)).size, 1);
});

test('the theme plays faster towards the end', () => {
  const steps = (from, to) => new Set(notesBetween(from, to, finale).map(({ step }) => step)).size;
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
