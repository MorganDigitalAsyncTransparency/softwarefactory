import { parseScript } from './script-parser.js';
import { duration, frameAt, startTimeFrom } from './timeline.js';
import { checkDrawings, draw } from './scenes.js';
import { intertitle } from './intertitle.js';
import { FRAME } from './layout.js';

const SCRIPT_URL = 'script/script.md';
const stage = document.getElementById('stage');
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
  document.addEventListener('keydown', (event) => {
    if (event.code !== 'Space') return;
    event.preventDefault();
    playButton.click();
  });
}

function play() {
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
  const frame = frameAt(playback.scenes, time);
  const { camera, picture } = render(frame);
  stage.setAttribute('viewBox', camera.join(' '));
  stage.replaceChildren(picture);
  progressBar.value = time;
  clock.textContent = `${formatClock(time)} / ${formatClock(duration(playback.scenes))}`;
}

function render({ scene, progress }) {
  const length = scene.end - scene.start;
  if (scene.type === 'intertitle') {
    return { camera: [FRAME.x, FRAME.y, FRAME.width, FRAME.height], picture: intertitle(scene.text, progress * length, length) };
  }
  return draw({ scene, progress, time: playback.time });
}

function formatClock(seconds) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function showError(error) {
  document.getElementById('error').textContent = `${error.message} Serve the film/ folder over HTTP; see docs/01-CONTRIBUTING.md.`;
}
