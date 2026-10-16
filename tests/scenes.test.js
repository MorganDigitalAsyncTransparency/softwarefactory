import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';
import { checkDrawings, draw } from '../film/animation/scenes.js';

test('every scene in the script has a drawing', () => {
  assert.doesNotThrow(() => checkDrawings(parseScript(readFileSync('film/script/script.md', 'utf8'))));
});

test('a scene with no drawing stops the animation with an error naming it', () => {
  assert.throws(() => checkDrawings([{ id: 'S99' }]), /S99/);
});

test('every scene gives a shot with a finite camera, or the split panels of S07', () => {
  const scenes = parseScript(readFileSync('film/script/script.md', 'utf8'));
  scenes.forEach((scene) => [0, 0.5, 1].forEach((progress) => {
    const shot = draw({ scene, progress });
    assert.ok(shot.split || shot.camera.flat().every(Number.isFinite), `${scene.id} at ${progress}`);
  }));
});

test('one continuous picture: each scene camera starts where the one before it stopped', () => {
  const scenes = parseScript(readFileSync('film/script/script.md', 'utf8'));
  scenes.slice(1).forEach((scene, index) => {
    const [before, after] = [draw({ scene: scenes[index], progress: 1 }), draw({ scene, progress: 0 })];
    const cut = before.fades?.includes('out') && after.fades?.includes('in');
    if (!cut) assert.deepEqual(after.camera, before.camera, `${scenes[index].id} to ${scene.id}`);
  });
});

test('the gate built in S08 stays in the factory for the rest of the film', () => {
  const shot = draw({ scene: { id: 'S12' }, progress: 0 });
  assert.equal(shot.state.gaps.B2, 'gate');
});
