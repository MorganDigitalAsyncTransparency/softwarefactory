import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';
import { draw } from '../film/animation/scenes.js';
import { accessAt, cabledStations, deniedCrew, readerVisit } from '../film/animation/access.js';
import { stationBuilt } from '../film/animation/schedule.js';

const scenes = parseScript(readFileSync('film/script/script.md', 'utf8'));
const length = scenes.at(-1).end;
const shares = Array.from({ length: 1501 }, (_, step) => step / 1500);
const stations = [...cabledStations()];
const denied = (buildShare) => stations.filter((key) => accessAt(key, buildShare) === 'denied');
// The scene that shows each access change, as visual-descriptions.md says.
const SHOWN_IN = { 'middle 0 0': 'S03', 'middle 0 1': 'S08', 'intake 2 0': 'S15' };
const outage = scenes.filter((scene) => draw({ scene, progress: 0 }).halts).map(({ start, end }) => [start / length, end / length]);

test('an access change stops one station at a time, a few times, never during the cloud outage', () => {
  const stops = new Set();
  shares.forEach((buildShare) => {
    const keys = denied(buildShare);
    assert.ok(keys.length <= 1, `${keys} at ${buildShare}`);
    assert.ok(!keys.length || outage.every(([from, to]) => buildShare < from || buildShare >= to), `stop at ${buildShare}`);
    keys.forEach((key) => stops.add(key));
  });
  assert.ok(stops.size >= 3, `${stops.size} stations stopped`);
});

test('only a finished station with a cable has its access changed or waits for it', () => {
  shares.forEach((buildShare) => stations.forEach((key) => {
    if (accessAt(key, buildShare) !== 'granted') assert.equal(stationBuilt(key, buildShare), 1, `${key} at ${buildShare}`);
  }));
  assert.ok(shares.some((buildShare) => stations.some((key) => accessAt(key, buildShare) === 'waiting')));
});

test('a Product developer waits at a denied station until an IT developer comes to put it right', () => {
  stations.forEach((key) => {
    const crews = shares.map((buildShare) => deniedCrew(key, buildShare)).filter((crew) => crew.length);
    if (!crews.length) return;
    assert.ok(crews.every((crew) => crew[0] === 'product'), key);
    assert.deepEqual(crews.at(-1), ['product', 'it'], key);
  });
});

test('each access change, IT developer and all, falls in the scene that shows it', () => {
  stations.forEach((key) => shares.forEach((buildShare) => {
    if (!deniedCrew(key, buildShare).length) return;
    const scene = scenes.find(({ id }) => id === SHOWN_IN[key]);
    assert.ok(scene && buildShare >= scene.start / length && buildShare < scene.end / length, `${key} at ${buildShare}`);
  }));
  Object.entries(SHOWN_IN).forEach(([key, id]) => {
    const { start, end } = scenes.find((scene) => scene.id === id);
    assert.ok(shares.some((buildShare) => buildShare >= start / length && buildShare < end / length && deniedCrew(key, buildShare).includes('it')), key);
  });
});

test('the card reader lets IT developers into the server room and nobody else', () => {
  const visits = shares.map(readerVisit).filter((visit) => visit?.light);
  assert.ok(visits.some(({ role }) => role === 'it') && visits.some(({ role }) => role !== 'it'));
  visits.forEach(({ role, light }) => assert.equal(light, role === 'it' ? 'ok' : 'stop'));
});
