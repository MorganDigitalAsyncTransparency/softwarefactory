import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseScript } from '../film/animation/script-parser.js';

const table = `
## Act 1: Who is here (0:00–1:12), level 1

| ID  | Time      | Scene                | Caption     |
| --- | --------- | -------------------- | ----------- |
| S01 | 0:00–0:04 | The camera descends. | A factory.  |
| S02 | 0:04–1:12 | The camera settles.  |             |
`;

test('reads every scene row with its ID, times in seconds, caption and act', () => {
  const act = { number: 1, title: 'Who is here' };
  assert.deepEqual(parseScript(table), [
    { id: 'S01', start: 0, end: 4, caption: 'A factory.', act },
    { id: 'S02', start: 4, end: 72, caption: '', act },
  ]);
});

test('ignores header, divider and prose lines', () => {
  assert.equal(parseScript(`${table}\nThe film ends with a fade.\n`).length, 2);
});

test('fails when the script has no scene rows', () => {
  assert.throws(() => parseScript('# Script\n'), /no scene rows/);
});
