import { parseScript } from './script-parser.js';
import { duration, fade, frameAt, startTimeFrom } from './timeline.js';
import { checkDrawings, draw } from './scenes.js';
import { showIntertitle } from './intertitle.js';
import { createStage } from './stage.js';

const SCRIPT_URL = 'script/script.md';
// Scenes fade from and to black, so a cut to an intertitle is never abrupt.
const FADE_SECONDS = 0.5;
const canvas = document.getElementById('stage');
const stage = createStage(canvas);
const card = document.getElementById('card');
const playButton = document.getElementById('play');
const restartButton = document.getElementById('restart');
const progressBar = document.getElementById('progress');
const clock = document.getElementById('clock');
const playback = { scenes: [], time: 0, playing: false, lastTick: null };

start().catch(showError);

async function start() {
  const response = await fetch(SCRIPT_URL);
  if (!response.ok) throw new Error(`Could not load ${SCRIPT_URL} (${response.status}).`);
  playback.scenes = parseScript(await response.text());
  checkDrawings(playback.scenes);
  progressBar.max = duration(playback.scenes);
  wireControls();
  const startTime = startTimeFrom(window.location.search);
  seek(Math.min(Math.max(startTime ?? 0, 0), duration(playback.scenes)));
  if (startTime === null) play();
}

function wireControls() {
  playButton.addEventListener('click', () => (playback.playing ? pause() : play()));
  restartButton.addEventListener('click', () => { seek(0); play(); });
  progressBar.addEventListener('input', () => seek(Number(progressBar.value)));
  window.addEventListener('resize', () => seek(playback.time));
  document.addEventListener('keydown', (event) => {
    if (event.code !== 'Space') return;
    event.preventDefault();
    playButton.click();
  });
}

function play() {
  if (playback.playing) return;
  if (playback.time >= duration(playback.scenes)) seek(0);
  playback.playing = true;
  playback.lastTick = null;
  playButton.setAttribute('aria-label', 'Pause');
  playButton.textContent = '❚❚';
  requestAnimationFrame(tick);
}

function pause() {
  playback.playing = false;
  playButton.setAttribute('aria-label', 'Play');
  playButton.textContent = '▶';
}

function tick(timestamp) {
  if (!playback.playing) return;
  const elapsed = playback.lastTick === null ? 0 : (timestamp - playback.lastTick) / 1000;
  playback.lastTick = timestamp;
  seek(Math.min(playback.time + elapsed, duration(playback.scenes)));
  if (playback.time >= duration(playback.scenes)) pause();
  else requestAnimationFrame(tick);
}

function seek(time) {
  playback.time = time;
  render(frameAt(playback.scenes, time));
  progressBar.value = time;
  clock.textContent = `${formatClock(time)} / ${formatClock(duration(playback.scenes))}`;
}

function render({ scene, progress }) {
  const length = scene.end - scene.start;
  if (scene.type === 'intertitle') {
    showIntertitle(card, scene.text, progress * length, length);
    return;
  }
  card.hidden = true;
  canvas.style.opacity = fade(progress * length, length, FADE_SECONDS);
  stage.render(draw({ scene, progress }), playback.time);
}

function formatClock(seconds) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function showError(error) {
  document.getElementById('error').textContent = `${error.message} Serve the film/ folder over HTTP; see docs/01-CONTRIBUTING.md.`;
}
