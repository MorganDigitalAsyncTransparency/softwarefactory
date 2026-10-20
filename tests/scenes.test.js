import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseScript } from '../film/animation/script-parser.js';
import { checkDrawings, draw, lineTime, peopleTime } from '../film/animation/scenes.js';
import { FITTING_SECONDS, gateSignal, laneFlows } from '../film/animation/flow.js';

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

function gateScene() {
  return scenes.find((scene) => draw({ scene, progress: 1 }).state?.gaps.B2 === 'gate');
}

// The gate built in the gate scene at `time`, its signal and the new boxes past it, as
// world.js draws them, with its fitting time moved to the line's clock.
function atGate(scene, time) {
  const { state } = draw({ scene, progress: (time - scene.start) / (scene.end - scene.start) });
  const line = lineTime(scenes, time);
  const fitted = Object.fromEntries(Object.entries(state.fitted).map(([key, at]) => [key, at - (time - line)]));
  const { stretch, boxes } = laneFlows({ ...state, fitted, ends: {}, laid: {} }, line, 1).find((flow) => flow.stretch.gates.length);
  const { x } = stretch.gates[0];
  return { state, signal: gateSignal(boxes, x), passed: boxes.filter((box) => box.look === 'new' && box.x > x && box.side === 0) };
}

test('in the gate scene a new box waits, a Product developer asks, the IT developer answers, and only then is the gate fitted and passes one', () => {
  const scene = gateScene();
  const times = Array.from({ length: 241 }, (_, step) => scene.start + (step / 240) * (scene.end - scene.start))
    .filter((time) => draw({ scene, progress: (time - scene.start) / (scene.end - scene.start) }).state.gaps.B2);
  const first = (found) => times.find((time) => found(atGate(scene, time)));
  const saying = (subject) => ({ state }) => state.crew.some(({ says }) => says === subject);
  const [waited, asked, answered] = [({ signal }) => signal === 'wait', saying('new'), saying('adapter')].map(first);
  const { fitted } = draw({ scene, progress: 1 }).state;
  const answerEnds = times.findLast((time) => saying('adapter')(atGate(scene, time)));
  assert.ok(waited < asked && asked < answered && answerEnds <= fitted.B2 - FITTING_SECONDS);
  assert.ok(times.some((time) => time > fitted.B2 && atGate(scene, time).passed.length));
});

test('no new box jumps out of the gate bin when the gate scene ends', () => {
  const scene = gateScene();
  const next = scenes[scenes.indexOf(scene) + 1];
  const [before, after] = [atGate(scene, scene.end - 1e-6), atGate(next, next.start)];
  assert.equal(after.passed.length, before.passed.length);
});

test('the line stands still only before any gate is fitted, so a fitting time moves to the line clock by one offset', () => {
  const halts = scenes.filter((scene) => draw({ scene, progress: 0 }).halts);
  assert.ok(halts.every((scene) => scene.end <= gateScene().start));
});

test('in the last scene one gate is still not fitted for new boxes', () => {
  const { gaps, fitted } = draw({ scene: scenes.at(-1), progress: 0.5 }).state;
  assert.ok(Object.keys(gaps).some((key) => gaps[key] === 'gate' && !(key in fitted)));
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
  const at = (time) => draw({ scene, progress: (time - scene.start) / (scene.end - scene.start) }).state.outage;
  assert.ok(Math.abs(at(last).seconds - (last - first)) < 1e-9 && at(first).seconds === 0);
  assert.ok(Math.abs(at(first).length - (last - first)) < 0.11);
});

test('a Software factory developer talks about code in S03 and while the gate is installed in S12', () => {
  ['S03', 'S12'].forEach((id) => {
    const scene = scenes.find((each) => each.id === id);
    const talks = [0.1, 0.3, 0.5, 0.7].some((progress) => {
      const { state } = draw({ scene, progress });
      return state.siteTalk || state.crew.some((member) => member.role === 'factory' && member.says === 'code');
    });
    assert.ok(talks, id);
  });
});
