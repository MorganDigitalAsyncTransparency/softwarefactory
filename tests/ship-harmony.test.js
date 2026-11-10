import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chordAt, frequency, hitsAt, shipNote } from '../ship/src/harmony.js';

test('the chords repeat every four bars', () => {
  assert.deepEqual(chordAt(4), chordAt(0));
  assert.notDeepEqual(chordAt(1), chordAt(0));
});

test('every shipped change plays a tone of the chord that sounds', () => {
  for (let count = 0; count < 12; count += 1) {
    const pitchClasses = chordAt(2).map((midi) => midi % 12);
    assert.ok(pitchClasses.includes(shipNote(2, count) % 12));
  }
});

test('shipped changes climb through the chord', () => {
  assert.ok(shipNote(0, 1) > shipNote(0, 0));
});

test('the drums join as the factory grows', () => {
  assert.deepEqual(hitsAt(0, 0), []);
  assert.deepEqual(hitsAt(1, 0), ['kick']);
  assert.ok(hitsAt(3, 4).includes('clap'));
});

test('A above middle C is 440 Hz', () => {
  assert.equal(frequency(69), 440);
});
