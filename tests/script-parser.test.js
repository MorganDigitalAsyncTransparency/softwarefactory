import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseScript } from '../film/animation/script-parser.js';

const table = `
## Act 1

| ID  | Time      | Type       | Content |
| --- | --------- | ---------- | ------- |
| S01 | 0:00–0:04 | Intertitle | **A factory.** |
| S02 | 0:04–1:12 | Scene      | The camera descends. |
`;

test('reads every scene row with its ID, times in seconds and type', () => {
  const scenes = parseScript(table);
  assert.deepEqual(scenes.map(({ id, start, end, type }) => ({ id, start, end, type })), [
    { id: 'S01', start: 0, end: 4, type: 'intertitle' },
    { id: 'S02', start: 4, end: 72, type: 'scene' },
  ]);
});

test('gives an intertitle its text without Markdown emphasis', () => {
  assert.equal(parseScript(table)[0].text, 'A factory.');
});

test('ignores header, divider and prose lines', () => {
  assert.equal(parseScript(`${table}\nThe film ends with a fade.\n`).length, 2);
});

test('fails when the script has no scene rows', () => {
  assert.throws(() => parseScript('# Script\n'), /no scene rows/);
});
