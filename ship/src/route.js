// Pure: where a change is on its way along a belt. A box drops onto the belt, rides to
// the gap, is carried across by hand or by a robot, passes the gate and ships at the
// end. A gate pushes a broken box off the belt.
export const ROUTE = { start: -24, gapFrom: -7, gapTo: -2, gate: 7, end: 24 };

export const SPEED = 9;
const DROP = 0.5;
const CARRY = { hand: 0.9, robot: 0.4 };
const FALL = 1.4;
const RISE = 1;

const STEPS = { drop, ride, carry, belt, pushed, rising, done };

export function newBox(lane, broken) {
  return { lane, broken, phase: 'drop', t: 0, x: ROUTE.start, y: 6, side: 0, seen: false };
}

// Moves the box on by dt seconds and returns what happened: 'carried', 'stopped',
// 'shipped', 'gone' or nothing.
export function advance(box, dt, rules) {
  box.t += dt;
  return STEPS[box.phase](box, rules);
}

function next(box, phase, event) {
  Object.assign(box, { phase, t: 0 });
  return event;
}

function drop(box) {
  box.y = 6 * Math.max(0, 1 - (box.t / DROP) ** 2);
  if (box.t >= DROP) return next(box, 'ride');
}

function ride(box, rules) {
  box.x = ROUTE.start + SPEED * box.t;
  if (box.x < ROUTE.gapFrom) return;
  box.carry = rules.robots ? CARRY.robot : CARRY.hand;
  return next(box, 'carry');
}

function carry(box) {
  const k = Math.min(1, box.t / box.carry);
  box.x = ROUTE.gapFrom + (ROUTE.gapTo - ROUTE.gapFrom) * k;
  box.y = Math.sin(Math.PI * k) * (box.carry === CARRY.robot ? 2.4 : 0.9);
  if (k === 1) return next(box, 'belt', 'carried');
}

function belt(box, rules) {
  box.x = ROUTE.gapTo + SPEED * box.t;
  if (rules.gates && box.broken && box.x >= ROUTE.gate) {
    box.seen = true;
    return next(box, 'pushed', 'stopped');
  }
  if (box.x >= ROUTE.end) return next(box, 'rising', 'shipped');
}

function pushed(box) {
  box.side = 4 * box.t;
  box.y = 2.5 * box.t - 9 * box.t ** 2;
  if (box.t >= FALL) return next(box, 'done', 'gone');
}

function rising(box) {
  box.y = 14 * box.t ** 2;
  if (box.t >= RISE) return next(box, 'done', 'gone');
}

// A box gone from the picture stays 'done' until it is removed.
function done() {}
