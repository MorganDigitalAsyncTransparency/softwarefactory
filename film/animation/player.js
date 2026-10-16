import { parseScript } from './script-parser.js';
import { duration, fade, frameAt, share, startTimeFrom } from './timeline.js';
import { checkDrawings, draw } from './scenes.js';
import { showCaption } from './caption.js';
import { createStage } from './stage.js';

const SCRIPT_URL = 'script/script.md';
// The picture fades from and to black only where a scene asks for it; captions fade at
// every scene's edges.
const FADE_SECONDS = 0.8;
const CAPTION_FADE_SECONDS = 0.6;
const canvas = document.getElementById('stage');
const stage = createStage(canvas);
const caption = document.getElementById('caption');
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
  const seconds = progress * length;
  const shot = draw({ scene, progress });
  const fades = shot.fades ?? [];
  const fadeIn = fades.includes('in') ? share(seconds, 0, FADE_SECONDS) : 1;
  const fadeOut = fades.includes('out') ? share(length - seconds, 0, FADE_SECONDS) : 1;
  canvas.style.opacity = Math.min(fadeIn, fadeOut);
  showCaption(caption, scene.caption, fade(seconds, length, CAPTION_FADE_SECONDS));
  stage.render(shot, playback.time);
}

function formatClock(seconds) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function showError(error) {
  document.getElementById('error').textContent = `${error.message} Serve the film/ folder over HTTP; see docs/01-CONTRIBUTING.md.`;
}
