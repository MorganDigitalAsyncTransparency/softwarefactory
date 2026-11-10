import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROUTE, advance, newBox } from '../ship/src/route.js';

const BY_HAND = { gates: false, robots: false };
const AUTOMATED = { gates: true, robots: true };

function travel(box, rules) {
  const events = [];
  for (let i = 0; i < 2000 && box.phase !== 'done'; i += 1) {
    const event = advance(box, 0.01, rules);
    if (event) events.push(event);
  }
  return events;
}

test('a good change is carried over the gap and ships', () => {
  assert.deepEqual(travel(newBox(0, false), BY_HAND), ['carried', 'shipped', 'gone']);
});

test('without gates a broken change reaches the users', () => {
  assert.ok(travel(newBox(0, true), BY_HAND).includes('shipped'));
});

test('a gate stops a broken change and pushes it off the belt', () => {
  const box = newBox(0, true);
  assert.deepEqual(travel(box, AUTOMATED), ['carried', 'stopped', 'gone']);
  assert.equal(box.seen, true);
  assert.ok(box.side > 0);
});

test('a robot carries faster than a person', () => {
  const carryTime = (rules) => {
    const box = newBox(0, false);
    while (box.phase !== 'carry') advance(box, 0.01, rules);
    let time = 0;
    for (; box.phase === 'carry'; time += 0.01) advance(box, 0.01, rules);
    return time;
  };
  assert.ok(carryTime(AUTOMATED) < carryTime(BY_HAND));
});

test('a change ships at the end of the belt', () => {
  const box = newBox(0, false);
  while (box.phase !== 'rising') advance(box, 0.01, BY_HAND);
  assert.ok(box.x >= ROUTE.end);
});
