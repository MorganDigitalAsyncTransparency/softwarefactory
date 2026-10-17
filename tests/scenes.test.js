import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';
import { checkDrawings, draw, lineTime, peopleTime } from '../film/animation/scenes.js';

const scenes = parseScript(readFileSync('film/script/script.md', 'utf8'));

test('every scene in the script has a drawing', () => {
  assert.doesNotThrow(() => checkDrawings(scenes));
});

test('a scene with no drawing stops the animation with an error naming it', () => {
  assert.throws(() => checkDrawings([{ id: 'S99' }]), /S99/);
});

test('every scene gives a shot with a finite camera, or the split panels', () => {
  scenes.forEach((scene) => [0, 0.5, 1].forEach((progress) => {
    const shot = draw({ scene, progress });
    assert.ok(shot.split || shot.camera.flat().every(Number.isFinite), `${scene.id} at ${progress}`);
  }));
});

test('one continuous picture: each scene camera starts where the one before it stopped', () => {
  scenes.slice(1).forEach((scene, index) => {
    const [before, after] = [draw({ scene: scenes[index], progress: 1 }), draw({ scene, progress: 0 })];
    if (before.fades?.includes('out') && after.fades?.includes('in')) return;
    const jump = Math.max(...after.camera.flat().map((value, axis) => Math.abs(value - before.camera.flat()[axis])));
    assert.ok(jump < 1e-9, `${scenes[index].id} to ${scene.id}`);
  });
});

test('the gate that is built stays in the factory for the rest of the film', () => {
  const built = scenes.findIndex((scene) => draw({ scene, progress: 1 }).state?.gaps.B2 === 'gate');
  assert.ok(built > 0);
  scenes.slice(built).filter((scene) => !draw({ scene, progress: 0 }).split)
    .forEach((scene) => assert.equal(draw({ scene, progress: 0.5 }).state.gaps.B2, 'gate', scene.id));
});

test('in the gate scene a Product developer asks, the IT developer answers, and only then is the gate fitted for new boxes', () => {
  const scene = scenes.find((candidate) => draw({ scene: candidate, progress: 1 }).state?.gaps.B2 === 'gate');
  const steps = Array.from({ length: 101 }, (_, step) => step / 100);
  const firstSaying = (subject) => steps.find((progress) => draw({ scene, progress }).state.crew.some(({ says }) => says === subject));
  const fittedAt = draw({ scene, progress: 1 }).state.adapted.B2;
  const [asked, answered] = [firstSaying('new'), firstSaying('adapter')].map((progress) => scene.start + progress * (scene.end - scene.start));
  assert.ok(asked < answered && answered < fittedAt && fittedAt < scene.end);
});

test('while the cloud is down the line stands still and the people hurry, and both go on from there', () => {
  const outage = scenes.filter((scene) => [0, 0.25, 0.5, 0.75, 1].some((progress) => draw({ scene, progress }).state?.outage));
  assert.equal(outage.length, 1);
  const [scene] = outage;
  const halted = Array.from({ length: 101 }, (_, step) => scene.start + (step / 100) * (scene.end - scene.start))
    .filter((time) => draw({ scene, progress: (time - scene.start) / (scene.end - scene.start) }).state.outage);
  assert.ok(halted.length > 10);
  assert.ok(halted.every((time) => Math.abs(lineTime(scenes, time) - lineTime(scenes, halted[0])) < 0.11));
  assert.equal(lineTime(scenes, scene.start), scene.start);
  const film = scenes.at(-1).end;
  assert.ok(Math.abs(film - lineTime(scenes, film) - (halted.at(-1) - halted[0])) < 0.3);
  const [first, last] = [halted[0], halted.at(-1)];
  assert.ok(peopleTime(scenes, last) - peopleTime(scenes, first) > 2 * (last - first));
});
