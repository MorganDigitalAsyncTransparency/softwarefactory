import { STAGES, isBroken, stageAt } from './story.js';
import { ROUTE } from './route.js';
import { LANE_Z, glow } from './look.js';
import { carriedBy, clearBoxes, drawBoxes, moveBoxes, spawnBox } from './boxes.js';
import { flashGate, updateFactory } from './factory.js';
import { burst, updateSparks } from './sparks.js';
import { updateCity } from './city.js';
import { trace } from './trace.js';

// The running factory: it drops changes onto the lanes, moves them, counts what ships
// and what the gates stop, and moves the story on by the count.
export function createGame() {
  return { clock: 0, shipped: 0, stopped: 0, stage: 0, held: null, started: false, stagedAt: 0, timers: LANE_Z.map((_, i) => i * 0.31) };
}

export function restart(game, world) {
  Object.assign(game, createGame(), { started: true, clock: game.clock });
  clearBoxes(world.boxes);
  world.band.setStage(0);
}

export function stepGame(game, world, dt) {
  game.clock += dt;
  const stage = STAGES[game.stage];
  dropDue(game, world.boxes, stage, dt);
  for (const { event, box } of moveBoxes(world.boxes, dt, stage)) react(game, world, event, box);
  const next = game.started ? game.held ?? stageAt(game.shipped) : 0;
  if (next !== game.stage) Object.assign(game, { stage: next, stagedAt: game.clock });
  world.band.setStage(game.stage);
  updateFactory(world.factory, { stage, time: game.clock, carriedBy: (lane) => carriedBy(world.boxes, lane) });
  updateCity(world.city, Boolean(stage.city), game.clock);
  updateSparks(world.sparks, dt);
  drawBoxes(world.boxes);
}

// A change dropped in by the viewer, on any lane that is running.
export function dropIn(game, world) {
  const lane = Math.floor(Math.random() * STAGES[game.stage].lanes);
  spawnBox(world.boxes, lane, isBroken(Math.random()));
  world.band.play('tap');
}

function dropDue(game, boxes, stage, dt) {
  for (let lane = 0; lane < stage.lanes; lane += 1) {
    game.timers[lane] -= dt;
    if (game.timers[lane] > 0) continue;
    game.timers[lane] += stage.spawn * (0.8 + Math.random() * 0.4);
    spawnBox(boxes, lane, isBroken(Math.random()));
  }
}

function react(game, world, event, box) {
  if (event === 'shipped') ship(game, world, box);
  if (event === 'stopped') stop(game, world, box);
}

function ship(game, world, box) {
  trace('ship');
  game.shipped += 1;
  world.band.play(box.broken ? 'broken' : 'shipped');
  burst(world.sparks, [ROUTE.end + 0.6, 1.4, LANE_Z[box.lane]], box.broken ? glow.red : glow.amber);
}

function stop(game, world, box) {
  trace('stop');
  game.stopped += 1;
  world.band.play('stopped');
  flashGate(world.factory, box.lane, game.clock);
  burst(world.sparks, [ROUTE.gate, 1.4, LANE_Z[box.lane]], glow.red, 10);
}
