import { createScene, jump, renderFrame } from './scene.js';
import { createFactory } from './factory.js';
import { createBoxes } from './boxes.js';
import { createSparks } from './sparks.js';
import { createCity } from './city.js';
import { createBand } from './band.js';
import { createGame, dropIn, restart, stepGame } from './game.js';
import { createUi, showLineCount, showUi } from './ui.js';
import { loadSource } from './source.js';
import { shotFor } from './camera.js';

const MAX_DT = 0.05;
const AUTO_START_SECONDS = 6;
const HOLD_REPEAT_SECONDS = 0.12;
const CARD_SHIPPED = 44;
const WARM_UP_FRAMES = 300;

const canvas = document.getElementById('stage');
const view = createScene(canvas);
const world = {
  factory: createFactory(view.scene),
  boxes: createBoxes(view.scene),
  sparks: createSparks(view.scene),
  city: createCity(view.scene),
  band: createBand(),
};
const game = createGame();
const ui = createUi(document);
const input = { holding: false, wait: 0, coding: false };

const params = new URLSearchParams(location.search);
if (params.has('card')) document.body.dataset.card = true;
if (params.has('card') || params.has('at')) warmUp(Number(params.get('at') ?? CARD_SHIPPED));
listen();
requestAnimationFrame(frame);
loadSource(document.getElementById('code')).then((lines) => showLineCount(ui, lines));

function frame(now) {
  const dt = Math.min(MAX_DT, (now - (frame.last ?? now)) / 1000);
  frame.last = now;
  if (!game.started && game.clock > AUTO_START_SECONDS) game.started = true;
  holdToDrop(dt);
  stepGame(game, world, dt);
  world.band.tick();
  showUi(ui, game, input.coding);
  renderFrame(view, currentShot(), game.stage, dt);
  requestAnimationFrame(frame);
}

function currentShot() {
  return shotFor(game.stage, game.clock, canvas.clientWidth / canvas.clientHeight, input.coding);
}

function holdToDrop(dt) {
  input.wait -= dt;
  if (!input.holding || input.wait > 0) return;
  input.wait = HOLD_REPEAT_SECONDS;
  dropIn(game, world);
}

function press() {
  world.band.start();
  if (!game.started) {
    game.started = true;
    game.stagedAt = game.clock;
  }
  input.holding = true;
  input.wait = 0;
}

function listen() {
  canvas.addEventListener('pointerdown', press);
  window.addEventListener('pointerup', () => (input.holding = false));
  window.addEventListener('pointercancel', () => (input.holding = false));
  window.addEventListener('keydown', (event) => event.code === 'Space' && !event.repeat && press());
  window.addEventListener('keyup', (event) => event.code === 'Space' && (input.holding = false));
  document.getElementById('sound').addEventListener('click', () => world.band.toggle());
  document.getElementById('again').addEventListener('click', () => restart(game, world));
  for (const button of document.querySelectorAll('#show-code, .show-code')) button.addEventListener('click', () => toggleCode(true));
  document.getElementById('hide-code').addEventListener('click', () => toggleCode(false));
}

function toggleCode(on) {
  input.coding = on;
  document.body.dataset.coding = on;
}

// Opens the factory as if that many changes had shipped, already running: for the
// link preview and for a reviewer who checks one stage.
function warmUp(shipped) {
  Object.assign(game, { started: true, shipped });
  for (let i = 0; i < WARM_UP_FRAMES; i += 1) stepGame(game, world, 1 / 30);
  jump(view, currentShot(), game.stage);
}
